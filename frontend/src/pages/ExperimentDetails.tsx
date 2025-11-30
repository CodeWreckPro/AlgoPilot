import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getExperimentResults, getExperimentStatus } from '../services/api'
import { RuntimeChart, MemoryChart } from '../components/Charts'
import { ResultsSummary } from '../types'
import * as ort from 'onnxruntime-web'

export default function ExperimentDetails() {
  const { id } = useParams()
  const [status, setStatus] = useState('loading')
  const [summary, setSummary] = useState<ResultsSummary | null>(null)
  const [predictions, setPredictions] = useState<{ size: number; runtimeMs: number; memoryBytes: number }[]>([])
  const [recommendedText, setRecommendedText] = useState<string>('')

  useEffect(() => {
    let mounted = true
    async function tick() {
      if (!id) return
      const s = await getExperimentStatus(id)
      if (!mounted) return
      setStatus(s.status)
      if (s.status === 'completed') {
        const r = await getExperimentResults(id)
        const rr: ResultsSummary = r as ResultsSummary
        if (!('results' in rr) || !Array.isArray(rr.results)) {
          try {
            const raw = await fetch(`https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/gh-pages/experiments/${id}/raw_results.json`).then((x) => x.json())
            rr.results = raw.results
          } catch { void 0 }
        }
        setSummary(rr)
        try {
          const reportUrl = `https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/gh-pages/experiments/${id}/report.md`
          const text = await fetch(reportUrl).then((x) => x.text())
          const line = text.split(/\r?\n/).find((l) => l.startsWith('Recommended: '))
          if (line) {
            setRecommendedText(line.replace('Recommended: ', '').trim())
          }
        } catch { void 0 }
        try {
          const base = `https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/gh-pages/experiments/${id}/ml`
          const session1 = await ort.InferenceSession.create(`${base}/model.onnx`)
          const sizes = rr.results.map((x) => x.size)
          const input = new ort.Tensor('float32', Float32Array.from(sizes.map((n: number) => n)), [sizes.length, 1])
          const feeds: Record<string, ort.Tensor> = { X: input }
          const out1 = await session1.run(feeds)
          const key1 = Object.keys(out1)[0]
          const y = Array.from(out1[key1].data as Float32Array)
          let m: number[] = []
          try {
            const session2 = await ort.InferenceSession.create(`${base}/memory.onnx`)
            const out2 = await session2.run(feeds)
            const key2 = Object.keys(out2)[0]
            m = Array.from(out2[key2].data as Float32Array)
          } catch { void 0 }
          setPredictions(sizes.map((sz: number, i: number) => ({ size: sz, runtimeMs: y[i], memoryBytes: m[i] ?? 0 })))
        } catch { void 0 }
      }
    }
    tick()
    const t = setInterval(tick, 5000)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [id])

  const data = (summary?.results || []).map((x) => ({ size: x.size, runtimeMs: x.runtimeMs, memoryBytes: x.memoryBytes }))

  function recommendedLabel() {
    if (recommendedText) return recommendedText
    if (!summary) return ''
    const order: string[] = []
    for (const r of summary.results || []) {
      if (!order.includes(r.implementationId)) order.push(r.implementationId)
    }
    const idx = order.indexOf(summary.ai.recommendedImplementationId)
    return idx >= 0 ? `Implementation ${idx + 1}` : summary.ai.recommendedImplementationId
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Experiment {id}</h1>
      <div>Status: {status}</div>
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Runtime vs size</h2>
            <RuntimeChart data={data} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Memory vs size</h2>
            <MemoryChart data={data} />
          </div>
        </div>
      )}
      {predictions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Predictions</h2>
          <div className="border rounded p-3 bg-gray-800 border-gray-700">
            {predictions.map((p) => (
              <div key={p.size} className="flex gap-4"><div>Size {p.size}</div><div>Runtime {p.runtimeMs.toFixed(2)} ms</div><div>Memory {Math.round(p.memoryBytes)} B</div></div>
            ))}
          </div>
        </div>
      )}
      {summary && (
        <div className="border rounded p-3 bg-gray-800 border-gray-700">
          <h2 className="text-lg font-semibold mb-2">AI Insights</h2>
          <div>Class: {summary.ai.complexityClass}</div>
          <div>Recommended: {recommendedLabel()}</div>
          <div className="mt-2 whitespace-pre-wrap">{summary.ai.justification}</div>
        </div>
      )}
      {summary && (
        <div className="border rounded p-3 bg-gray-800 border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Report</h2>
          <div>
            <a className="text-blue-600 underline" target="_blank" href={`https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/gh-pages/experiments/${id}/report.md`}>Open report.md</a>
          </div>
        </div>
      )}
    </div>
  )
}

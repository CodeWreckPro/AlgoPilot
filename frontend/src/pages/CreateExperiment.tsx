import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import CodeEditor from '../components/CodeEditor'
import { createExperiment } from '../services/api'
import { Implementation } from '../types'

export default function CreateExperiment() {
  const [title, setTitle] = useState('')
  const [implementations, setImplementations] = useState<Implementation[]>([])
  const [sizes, setSizes] = useState<string>('100,1000,10000')
  const [dists, setDists] = useState<string>('random,sorted,reverse')
  const [metricsRuntime, setMetricsRuntime] = useState(true)
  const [metricsMemory, setMetricsMemory] = useState(true)
  const [language, setLanguage] = useState<'python' | 'typescript'>('python')

  function addImplementation() {
    const id = uuid()
    setImplementations((x) => x.concat([{ id, name: `Impl ${x.length + 1}`, language, code: '' }]))
  }

  async function onSubmit() {
    const payload = {
      title,
      language,
      implementations,
      inputProfile: { sizes: sizes.split(',').map((s) => parseInt(s.trim(), 10)), distributions: dists.split(',').map((s) => s.trim()) },
      metricsRequested: { runtime: metricsRuntime, memory: metricsMemory },
      constraints: {}
    }
    const res = await createExperiment(payload)
    const item = { id: res.id as string, title, status: 'queued', createdAt: new Date().toISOString() }
    const saved = localStorage.getItem('algopilot-experiments')
    const list = saved ? JSON.parse(saved) : []
    localStorage.setItem('algopilot-experiments', JSON.stringify([item].concat(list)))
    window.location.hash = `#/experiments/${res.id}`
  }

  function updateImpl(id: string, data: Partial<Implementation>) {
    setImplementations((arr) => arr.map((x) => (x.id === id ? { ...x, ...data } : x)))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Experiment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block">
            <span className="block mb-1">Title</span>
            <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="block mb-1">Language</span>
            <select className="w-full border rounded p-2" value={language} onChange={(e) => setLanguage(e.target.value as 'python' | 'typescript')}>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </label>
          <label className="block">
            <span className="block mb-1">Input sizes</span>
            <input className="w-full border rounded p-2" value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </label>
          <label className="block">
            <span className="block mb-1">Distributions</span>
            <input className="w-full border rounded p-2" value={dists} onChange={(e) => setDists(e.target.value)} />
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={metricsRuntime} onChange={(e) => setMetricsRuntime(e.target.checked)} /> Runtime</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={metricsMemory} onChange={(e) => setMetricsMemory(e.target.checked)} /> Memory</label>
          </div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={addImplementation}>Add Implementation</button>
        </div>
        <div className="space-y-6">
          {implementations.map((impl) => (
            <div key={impl.id} className="border rounded p-3">
              <input className="w-full border rounded p-2 mb-2" value={impl.name} onChange={(e) => updateImpl(impl.id, { name: e.target.value })} />
              <CodeEditor language={impl.language} value={impl.code} onChange={(v) => updateImpl(impl.id, { code: v })} />
            </div>
          ))}
        </div>
      </div>
      <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={onSubmit} disabled={!title || implementations.length === 0}>Submit</button>
    </div>
  )
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Octokit } from '@octokit/rest'
import * as ort from 'onnxruntime-node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { id, sizes } = req.body as { id: string; sizes: number[] }
  const owner = process.env.GITHUB_OWNER as string
  const repo = process.env.GITHUB_REPO as string
  const token = process.env.GITHUB_TOKEN as string
  const octokit = new Octokit({ auth: token })
  try {
    const r1 = await octokit.repos.getContent({ owner, repo, path: `experiments/${id}/ml/model.onnx`, ref: 'gh-pages' })
    if (!('content' in r1.data)) return res.status(404).json({ error: 'Not found' })
    const buf1 = Buffer.from(r1.data.content, 'base64')
    const session1 = await ort.InferenceSession.create(buf1)
    const input = new ort.Tensor('float32', Float32Array.from(sizes.map((n) => n)), [sizes.length, 1])
    const feeds: Record<string, ort.Tensor> = { X: input }
    const out1 = await session1.run(feeds)
    const firstKey1 = Object.keys(out1)[0]
    const runtime = Array.from((out1[firstKey1].data as Float32Array))

    let memory: number[] = []
    try {
      const r2 = await octokit.repos.getContent({ owner, repo, path: `experiments/${id}/ml/memory.onnx`, ref: 'gh-pages' })
      if ('content' in r2.data) {
        const buf2 = Buffer.from(r2.data.content, 'base64')
        const session2 = await ort.InferenceSession.create(buf2)
        const out2 = await session2.run(feeds)
        const firstKey2 = Object.keys(out2)[0]
        memory = Array.from((out2[firstKey2].data as Float32Array))
      }
    } catch { void 0 }
  
    return res.status(200).json({ predictions: sizes.map((s, i) => ({ size: s, runtimeMs: runtime[i], memoryBytes: memory[i] ?? 0 })) })
  } catch {
    return res.status(500).json({ error: 'Inference error' })
  }
}

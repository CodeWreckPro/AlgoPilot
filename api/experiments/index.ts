import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Octokit } from '@octokit/rest'
import { z } from 'zod'
import crypto from 'crypto'

const bodySchema = z.object({
  title: z.string(),
  language: z.enum(['python', 'typescript']),
  implementations: z.array(z.object({ id: z.string(), name: z.string(), language: z.enum(['python', 'typescript']), code: z.string(), tags: z.array(z.string()).optional() })),
  inputProfile: z.object({ sizes: z.array(z.number()), distributions: z.array(z.string()) }),
  metricsRequested: z.object({ runtime: z.boolean(), memory: z.boolean() }),
  constraints: z.object({ latencyPreference: z.string().optional(), memoryPreference: z.string().optional() })
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Access-Control-Allow-Origin', '*')
  const parse = bodySchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'Invalid body' })
  const owner = process.env.GITHUB_OWNER as string
  const repo = process.env.GITHUB_REPO as string
  const token = process.env.GITHUB_TOKEN as string
  if (!owner || !repo || !token) return res.status(500).json({ error: 'Missing GitHub config' })
  const octokit = new Octokit({ auth: token })
  const id = crypto.randomUUID()
  const path = `experiments/${id}/config.json`
  const content = Buffer.from(JSON.stringify({ id, ...parse.data }), 'utf8').toString('base64')
  await octokit.repos.createOrUpdateFileContents({ owner, repo, path, message: `Create experiment ${id}`, content })
  await octokit.actions.createWorkflowDispatch({ owner, repo, workflow_id: 'benchmark.yml', ref: 'main', inputs: { experiment_id: id } })
  return res.status(201).json({ id })
}

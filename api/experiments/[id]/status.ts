import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Octokit } from '@octokit/rest'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  const id = req.query.id as string
  const owner = process.env.GITHUB_OWNER as string
  const repo = process.env.GITHUB_REPO as string
  const token = process.env.GITHUB_TOKEN as string
  const octokit = new Octokit({ auth: token })
  try {
    await octokit.repos.getContent({ owner, repo, path: `experiments/${id}/results.json`, ref: 'gh-pages' })
    return res.status(200).json({ status: 'completed' })
  } catch { void 0 }
  try {
    const runs = await octokit.actions.listWorkflowRuns({ owner, repo, workflow_id: 'benchmark.yml', event: 'workflow_dispatch', per_page: 10 })
    const latest = runs.data.workflow_runs[0]
    if (!latest) return res.status(200).json({ status: 'queued' })
    return res.status(200).json({ status: latest.status })
  } catch {
    return res.status(200).json({ status: 'unknown' })
  }
}

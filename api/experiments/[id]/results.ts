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
    const r = await octokit.repos.getContent({ owner, repo, path: `experiments/${id}/results.json`, ref: 'gh-pages' })
    if ('content' in r.data) {
      const json = Buffer.from(r.data.content, 'base64').toString('utf8')
      return res.status(200).json(JSON.parse(json))
    }
    return res.status(404).json({ error: 'Not found' })
  } catch {
    return res.status(404).json({ error: 'Not found' })
  }
}

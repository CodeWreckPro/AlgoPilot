const owner = import.meta.env.VITE_GITHUB_OWNER
const repo = import.meta.env.VITE_GITHUB_REPO

export async function fetchGhPagesJson(path: string) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/gh-pages/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

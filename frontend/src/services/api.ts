const base = import.meta.env.VITE_API_BASE_URL || ''

export async function createExperiment(payload: Omit<import('../types').Experiment, 'id' | 'createdAt' | 'status'>) {
  const res = await fetch(`${base}/api/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to create experiment')
  return res.json()
}

export async function getExperimentStatus(id: string) {
  const res = await fetch(`${base}/api/experiments/${id}/status`)
  if (!res.ok) throw new Error('Failed to fetch status')
  return res.json()
}

export async function getExperimentResults(id: string) {
  const res = await fetch(`${base}/api/experiments/${id}/results`)
  if (!res.ok) throw new Error('Failed to fetch results')
  return res.json()
}

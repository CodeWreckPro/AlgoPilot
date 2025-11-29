export type Language = 'python' | 'typescript'

export type Implementation = {
  id: string
  name: string
  language: Language
  code: string
  tags?: string[]
}

export type Experiment = {
  id: string
  title: string
  language: Language
  implementations: Implementation[]
  inputProfile: { sizes: number[]; distributions: string[] }
  metricsRequested: { runtime: boolean; memory: boolean }
  constraints: { latencyPreference?: string; memoryPreference?: string }
  status?: string
  createdAt?: string
}

export type BenchmarkResult = {
  implementationId: string
  size: number
  distribution: string
  runtimeMs: number
  memoryBytes: number
}

export type ResultsSummary = {
  experimentId: string
  results: BenchmarkResult[]
  ai: {
    complexityClass: string
    predicted: { size: number; runtimeMs: number; memoryBytes: number }[]
    recommendedImplementationId: string
    justification: string
  }
}

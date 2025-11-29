import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  data: { size: number; runtimeMs?: number; memoryBytes?: number; name?: string }[]
}

export function RuntimeChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="size" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="runtimeMs" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MemoryChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="size" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="memoryBytes" stroke="#10b981" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

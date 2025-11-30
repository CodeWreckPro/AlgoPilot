import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  data: { size: number; runtimeMs?: number; memoryBytes?: number; name?: string }[]
}

export function RuntimeChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="size" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} labelStyle={{ color: '#E5E7EB' }} />
          <Legend wrapperStyle={{ color: '#E5E7EB' }} />
          <Line type="monotone" dataKey="runtimeMs" stroke="#60A5FA" dot={false} />
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
          <XAxis dataKey="size" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} labelStyle={{ color: '#E5E7EB' }} />
          <Legend wrapperStyle={{ color: '#E5E7EB' }} />
          <Line type="monotone" dataKey="memoryBytes" stroke="#34D399" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

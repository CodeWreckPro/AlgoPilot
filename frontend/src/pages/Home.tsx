import { Link } from 'react-router-dom'

type Item = { id: string; title: string; status: string; createdAt: string }

export default function Home() {
  const [items, setItems] = useState<Item[]>([])

  function useState<T>(initial: T) {
    return React.useState<T>(initial)
  }

  React.useEffect(() => {
    const saved = localStorage.getItem('algopilot-experiments')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Experiments</h1>
        <Link to="/create" className="px-3 py-2 bg-blue-600 text-white rounded">Create Experiment</Link>
      </div>
      <div className="border rounded bg-white">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-3"><Link to={`/experiments/${x.id}`} className="text-blue-600 underline">{x.title}</Link></td>
                <td className="p-3">{x.status}</td>
                <td className="p-3">{new Date(x.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

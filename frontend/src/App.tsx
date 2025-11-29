import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CreateExperiment from './pages/CreateExperiment'
import ExperimentDetails from './pages/ExperimentDetails'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">AlgoPilot</Link>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/create" className="hover:underline">Create Experiment</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateExperiment />} />
          <Route path="/experiments/:id" element={<ExperimentDetails />} />
        </Routes>
      </main>
    </div>
  )
}

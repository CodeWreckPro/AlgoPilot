import Editor from '@monaco-editor/react'

type Props = {
  language: 'python' | 'typescript'
  value: string
  onChange: (v: string) => void
}

export default function CodeEditor({ language, value, onChange }: Props) {
  return (
    <div className="border rounded border-gray-700">
      <Editor height="300px" theme="vs-dark" defaultLanguage={language} value={value} onChange={(v) => onChange(v || '')} options={{ minimap: { enabled: false } }} />
    </div>
  )
}

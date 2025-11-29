'use client'
import { useMemo, useState } from 'react'
import { Card, CardHeader, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Progress } from '../../components/ui/progress'

function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  const i = Math.max(0, Math.min(s.length - 1, Math.round((p / 100) * (s.length - 1))))
  return Number(s[i].toFixed(3))
}

export default function BenchPage() {
  const [query, setQuery] = useState('Summarize the benefits of regular exercise in two sentences.')
  const [context, setContext] = useState('')
  const [mode, setMode] = useState<'parallel' | 'sequential'>('parallel')
  const [runs, setRuns] = useState(10)
  const [durations, setDurations] = useState<number[]>([])
  const [running, setRunning] = useState(false)

  const models = [
    'gpt-4.1',
    'gpt-5.1',
    'gemini-2.5-flash',
    'deepseek/deepseek-chat-v3-0324:free',
  ]

  async function run() {
    setRunning(true)
    const ds: number[] = []
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now()
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, models, context, preset: 'general', mode })
      })
      if (!res.ok) {
        break
      }
      const t1 = performance.now()
      ds.push((t1 - t0) / 1000)
      setDurations([...ds])
    }
    setRunning(false)
  }

  const p50 = useMemo(() => percentile(durations, 50), [durations])
  const p95 = useMemo(() => percentile(durations, 95), [durations])
  const last = useMemo(() => durations.at(-1) ?? 0, [durations])

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Latency Bench</h1>
          <Badge variant={mode === 'parallel' ? 'secondary' : 'outline'}>
            Mode: {mode}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm">Query</label>
              <Textarea value={query} onChange={e => setQuery(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Context</label>
              <Textarea value={context} onChange={e => setContext(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Mode</label>
              <Select value={mode} onChange={e => setMode(e.target.value as any)}>
                <option value="parallel">parallel</option>
                <option value="sequential">sequential</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Runs</label>
              <input type="number" className="w-full rounded-lg border-2 border-slate-700 bg-[#334155] p-2.5 text-white" min={1} max={100} value={runs} onChange={e => setRuns(Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button disabled={running} onClick={run}>
              {running ? 'Running…' : 'Run'}
            </Button>
            <div className="flex-1">
              <Progress value={durations.length ? (durations.length / Math.max(1, runs)) * 100 : 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-300">Runs</div>
              <div className="text-xl font-semibold">{durations.length}</div>
            </div>
            <div>
              <div className="text-sm text-slate-300">p50</div>
              <div className="text-xl font-semibold">{p50}s</div>
            </div>
            <div>
              <div className="text-sm text-slate-300">p95</div>
              <div className="text-xl font-semibold">{p95}s</div>
            </div>
            <div>
              <div className="text-sm text-slate-300">Last</div>
              <div className="text-xl font-semibold">{last}s</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-[#0f172a]">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Duration (s)</th>
                </tr>
              </thead>
              <tbody>
                {durations.map((d, i) => (
                  <tr key={i} className="odd:bg-[#1f2937] even:bg-[#111827]">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

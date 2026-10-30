interface StatCardProps {
  label: string
  value: number
  detail: string
  tone: 'green' | 'blue' | 'indigo' | 'rose'
}

const toneStyles = {
  green: 'bg-brand-50 text-brand-600',
  blue: 'bg-sky-50 text-sky-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  rose: 'bg-rose-50 text-rose-600',
}

export default function StatCard({ label, value, detail, tone }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneStyles[tone]}`}>
          <span aria-hidden="true" className="text-base font-semibold">
            {tone === 'green' ? '◷' : tone === 'blue' ? '▦' : tone === 'indigo' ? '✓' : '×'}
          </span>
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </article>
  )
}

import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip, Legend, TimeScale } from 'chart.js'
import 'chartjs-adapter-moment'
import { MonitorState, MonitorTarget } from '@/types/config'
import { codeToCountry } from '@/util/iata'
import { date, ms, t } from '@/util/i18n'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Legend, TimeScale)

export default function DetailChart({ monitor, state }: { monitor: MonitorTarget; state: MonitorState }) {
  const css = getComputedStyle(document.documentElement)
  const accent = css.getPropertyValue('--accent').trim() || '#8b45c6'
  const grid = css.getPropertyValue('--line').trim() || 'rgba(128,128,128,.2)'
  const text = css.getPropertyValue('--muted').trim() || '#888'
  const latencyData = state.latency[monitor.id].map((p) => ({ x: p.time * 1000, y: p.ping, loc: p.loc }))

  const data = {
    datasets: [{ data: latencyData, borderColor: accent, backgroundColor: accent + '22', fill: true, borderWidth: 2, radius: 0, tension: 0.4, cubicInterpolationMode: 'monotone' as const }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any[]) => (items.length ? date(items[0].parsed.x, { dateStyle: 'medium', timeStyle: 'short' }) : ''),
          label: (item: any) => (item.parsed.y ? t('chart.point', { ms: ms(item.parsed.y), where: codeToCountry(item.raw.loc) }) : ''),
        },
      },
    },
    scales: {
      x: { type: 'time' as const, grid: { color: grid }, ticks: { color: text, maxRotation: 0, autoSkip: true, callback: (v: string | number) => date(Number(v), { hour: 'numeric', minute: '2-digit' }) } },
      y: { grid: { color: grid }, ticks: { color: text } },
    },
  }
  return (
    <div className="latency-chart" style={{ height: 150, marginTop: 10 }}>
      <Line options={options} data={data} role="img" aria-label={t('chart.label', { name: monitor.name })} />
    </div>
  )
}

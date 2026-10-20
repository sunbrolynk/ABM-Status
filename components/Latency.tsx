import { useState } from 'react'
import { MonitorState, MonitorTarget } from '@/types/config'
import DetailChart from './DetailChart'

export default function Latency({
  monitor,
  state,
  openLabel,
  closeLabel,
  className = 'latency',
}: {
  monitor: MonitorTarget
  state: MonitorState
  openLabel: string
  closeLabel: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={className}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? closeLabel : openLabel}
      </button>
      {open && <DetailChart monitor={monitor} state={state} />}
    </div>
  )
}

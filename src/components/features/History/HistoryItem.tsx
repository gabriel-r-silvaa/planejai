import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { SimulationRecord } from '@/data/simulation'
import { statusStyles } from '@/utils/insightStatus'

interface HistoryItemProps {
  simulation: SimulationRecord
}

export function HistoryItem({ simulation }: HistoryItemProps) {
  const navigate = useNavigate()

  const status = simulation.insight
    ? statusStyles[simulation.insight.feasibility.status]
    : null

  const date = simulation.createdAt
    ? new Date(simulation.createdAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : null

  return (
    <button
      type="button"
      onClick={() => void navigate(`/resultado/${simulation.id}`)}
      className="bg-card flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] transition-opacity hover:opacity-80"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-foreground truncate font-semibold">
            {simulation.goalName}
          </p>
          {status && (
            <span
              className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {simulation.goalAmount} em {simulation.goalDeadline} meses
        </p>
        {date && <p className="text-muted-foreground mt-1 text-xs">{date}</p>}
      </div>
      <ChevronRight className="text-muted-foreground shrink-0" size={20} />
    </button>
  )
}

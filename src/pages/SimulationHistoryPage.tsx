import { RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { HistoryItem } from '@/components/features/History/HistoryItem'
import { Button } from '@/components/shared/Button'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

type HistoryState =
  | { status: 'ready'; simulations: SimulationRecord[] }
  | { status: 'error' }

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllSimulations } = useSimulationStorage()

  const readHistory = (): HistoryState => {
    try {
      return { status: 'ready', simulations: getAllSimulations() }
    } catch {
      return { status: 'error' }
    }
  }

  const [state, setState] = useState<HistoryState>(readHistory)

  if (state.status === 'error') {
    return (
      <main
        className="mx-auto max-w-xl px-4 py-10 text-center sm:py-14"
        role="alert"
      >
        <PageHero
          title="Não foi possível carregar seu histórico"
          subtitle="Houve um problema ao ler as simulações salvas neste navegador."
        />
        <Button
          variant="primary"
          className="mx-auto"
          icon={RefreshCw}
          onClick={() => setState(readHistory())}
        >
          Tentar novamente
        </Button>
      </main>
    )
  }

  if (state.simulations.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-center sm:py-14">
        <PageHero
          title="Histórico de simulações"
          subtitle="Você ainda não possui simulações salvas."
        />
        <Button
          variant="primary"
          className="mx-auto"
          icon={TrendingUp}
          onClick={() => void navigate('/')}
        >
          Fazer minha primeira simulação
        </Button>
      </main>
    )
  }

  const subtitle =
    state.simulations.length === 1
      ? '1 simulação salva neste navegador.'
      : `${state.simulations.length} simulações salvas neste navegador.`

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <PageHero title="Histórico de simulações" subtitle={subtitle} />
      <div className="flex flex-col gap-4">
        {state.simulations.map((simulation) => (
          <HistoryItem key={simulation.id} simulation={simulation} />
        ))}
      </div>
    </main>
  )
}

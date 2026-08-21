import { RefreshCw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ChatInputForm } from '@/components/features/Chat/ChatInputForm'
import {
  MessageBubble,
  TypingIndicator,
} from '@/components/features/Chat/MessageBubble'
import { Button } from '@/components/shared/Button'
import { PageHero } from '@/components/shared/PageHero'
import { useChat } from '@/hooks/useChat'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

export function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const simulationId = searchParams.get('simulacao')

  const { getFormData } = useSimulationStorage()
  const simulation = simulationId ? getFormData(simulationId) : null

  const { messages, isLoading, error, sendMessage, retry } = useChat(simulation)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading, error])

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-10 sm:py-14">
      <PageHero
        title="Educador Financeiro"
        subtitle={
          simulation
            ? `Conversando com o contexto da meta "${simulation.goalName}".`
            : 'Tire suas dúvidas sobre organização financeira, gastos e metas.'
        }
      />
      {simulation && (
        <button
          type="button"
          onClick={() => void navigate(`/resultado/${simulation.id}`)}
          className="text-primary -mt-4 mb-6 cursor-pointer text-left text-sm font-medium hover:underline"
        >
          ← Ver resultado completo dessa simulação
        </button>
      )}

      <div className="bg-card flex h-[60vh] flex-col gap-3 overflow-y-auto rounded-2xl p-4 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] sm:h-[65vh]">
        {messages.length === 0 && !isLoading && (
          <p className="text-muted-foreground m-auto max-w-xs text-center text-sm">
            Pergunte qualquer coisa sobre como organizar suas finanças ou
            atingir sua meta.
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {!isLoading && error && (
          <div
            role="alert"
            className="mx-auto flex flex-col items-center gap-2 py-2 text-center"
          >
            <p className="text-sm text-red-500">⚠️ {error}</p>
            <Button
              variant="primary"
              className="px-6"
              icon={RefreshCw}
              onClick={retry}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInputForm onSend={sendMessage} disabled={isLoading} />
    </main>
  )
}

import { useCallback, useState } from 'react'

import { buildChatSystemInstruction } from '@/data/chatPrompt'
import type { SimulationRecord } from '@/data/simulation'
import { type ChatRole, getChatReply } from '@/services/aiService'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
}

export const useChat = (context?: SimulationRecord | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const systemInstruction = buildChatSystemInstruction(context)

  const requestReply = useCallback(
    async (history: ChatMessage[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const reply = await getChatReply(
          history.map(({ role, text }) => ({ role, text })),
          systemInstruction,
        )

        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: 'model', text: reply },
        ])
      } catch {
        setError(
          'Não consegui responder agora. Verifique sua conexão e tente novamente.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [systemInstruction],
  )

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()

      if (!trimmed || isLoading) {
        return
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: trimmed,
      }
      const nextMessages = [...messages, userMessage]

      setMessages(nextMessages)
      void requestReply(nextMessages)
    },
    [messages, isLoading, requestReply],
  )

  const retry = useCallback(() => {
    void requestReply(messages)
  }, [messages, requestReply])

  return { messages, isLoading, error, sendMessage, retry }
}

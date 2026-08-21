import type { ChatMessage } from '@/hooks/useChat'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <p
        className={[
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-secondary-button text-foreground rounded-bl-sm',
        ].join(' ')}
      >
        {message.text}
      </p>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status">
      <span className="sr-only">Educador Financeiro está digitando...</span>
      <div className="bg-secondary-button flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3.5">
        <span className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <span className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <span className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full" />
      </div>
    </div>
  )
}

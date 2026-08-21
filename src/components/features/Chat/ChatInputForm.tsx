import { Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

interface ChatInputFormProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInputForm({ onSend, disabled }: ChatInputFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const trimmed = value.trim()

    if (!trimmed) {
      return
    }

    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Escreva sua dúvida sobre finanças..."
          disabled={disabled}
          aria-label="Mensagem para o Educador Financeiro"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        icon={Send}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
      />
    </form>
  )
}

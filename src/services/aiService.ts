interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
    }
  }[]
  error?: {
    message?: string
    status?: string
  }
}

export type ChatRole = 'user' | 'model'

export interface ChatTurn {
  role: ChatRole
  text: string
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: {
    content: string
  }
  suggestions: {
    items: string[]
  }
  extraIncome: {
    items: string[]
  }
  investment: {
    items: string[]
  }
  motivation: {
    content: string
  }
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY)
const MODEL_NAME = 'gemini-3.6-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const callGeminiAPI = async (
  contents: ChatTurn[],
  systemInstruction?: string,
) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('A chave VITE_GEMINI_API_KEY não foi configurada.')
  }

  const requestBody = {
    contents: contents.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    })),
    ...(systemInstruction && {
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const data = (await response.json()) as GeminiResponse

    if (response.ok) {
      return data
    }

    const isTemporaryError = [429, 500, 502, 503, 504].includes(response.status)

    if (isTemporaryError && attempt < 2) {
      await wait(1000 * 2 ** attempt)
      continue
    }

    throw new Error(
      data.error?.message ||
        `O Gemini está temporariamente indisponível (HTTP ${response.status}). Tente novamente em instantes.`,
    )
  }

  throw new Error('Não foi possível obter uma resposta do Gemini.')
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI([{ role: 'user', text: prompt }])
  const json = response.candidates?.[0]?.content.parts[0]?.text

  if (!json) {
    throw new Error('A API do Gemini retornou uma resposta vazia.')
  }

  const cleanJson = json.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  return JSON.parse(cleanJson) as InsightData
}

export const getChatReply = async (
  history: ChatTurn[],
  systemInstruction?: string,
) => {
  const response = await callGeminiAPI(history, systemInstruction)
  const text = response.candidates?.[0]?.content.parts[0]?.text

  if (!text) {
    throw new Error('A API do Gemini retornou uma resposta vazia.')
  }

  return text
}

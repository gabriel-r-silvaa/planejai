import { calcMonthlySavings } from '@/utils/simulation'

import type { SimulationRecord } from './simulation'

const BASE_INSTRUCTION = `Você é o Educador Financeiro do Planej.ai, especializado em finanças pessoais.
Converse de forma clara, didática e encorajadora, em português do Brasil, com pessoas sem
conhecimento financeiro prévio. Fale sempre em segunda pessoa ("você tem...", "sua meta...").
Dê respostas curtas, práticas e objetivas. Nunca invente valores que a pessoa não informou.`

export function buildChatSystemInstruction(
  simulation?: SimulationRecord | null,
) {
  if (!simulation) {
    return BASE_INSTRUCTION
  }

  const monthlySavings = calcMonthlySavings(simulation)
  const diagnosisNote = simulation.insight
    ? `\n- Diagnóstico já gerado anteriormente: ${simulation.insight.diagnosis.content}`
    : ''

  return `${BASE_INSTRUCTION}

Contexto financeiro desta pessoa, use como referência quando fizer sentido, sem repetir todos os números em toda resposta:
- Renda mensal bruta: ${simulation.income}
- Custos fixos essenciais: ${simulation.expenses}
- Dívidas e parcelas mensais: ${simulation.debts}
- Valor disponível por mês: ${monthlySavings} reais
- Meta: ${simulation.goalName}
- Custo da meta: ${simulation.goalAmount}
- Prazo desejado: ${simulation.goalDeadline} meses${diagnosisNote}`
}

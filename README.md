# Planej.ai: Educador Financeiro com IA Generativa

Aplicação web de planejamento financeiro pessoal que transforma um formulário simples em um diagnóstico gerado por IA, com sugestões práticas para o usuário alcançar sua meta.

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Demonstração](#demonstração)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como executar](#como-executar)
- [Problemas comuns com a API do Gemini](#problemas-comuns-com-a-api-do-gemini)
- [Melhoria implementada: experiência de carregamento e erro](#melhoria-implementada-experiência-de-carregamento-e-erro)
- [Fluxo principal](#fluxo-principal)
- [Como testar](#como-testar)
- [O que aprendi](#o-que-aprendi)
- [Evolução do projeto](#evolução-do-projeto)
- [Prints e evidências](#prints-e-evidências)

## Sobre o projeto

O **Planej.ai** é uma aplicação de planejamento financeiro pessoal. O usuário informa sua renda, seus gastos fixos, suas dívidas e uma meta financeira (uma viagem, um curso, a compra de um bem), e a aplicação usa a API do **Google Gemini** para gerar um diagnóstico personalizado: se a meta é viável no prazo informado, quanto da renda está comprometida, sugestões práticas de ajuste no orçamento, ideias de renda extra e de investimento, e uma mensagem final motivacional.

Não existe backend nem banco de dados remoto. Tudo roda no navegador: os dados das simulações ficam salvos no `localStorage` e a análise é gerada em tempo real, direto do cliente para a API de IA.

Este repositório é um fork feito para um desafio prático de um curso de desenvolvimento front-end com React e IA generativa (projeto "Educador Financeiro", da DIO). O projeto foi construído aula a aula ao longo do curso, e o desafio proposto neste fork foi ir além do conteúdo ensinado: **melhorar a experiência de carregamento e erro** da aplicação, deixando-a mais robusta e mais clara para quem está usando.

O protótipo visual usado como referência de design está disponível no Figma: [Educador Financeiro (DIO)](https://www.figma.com/design/MVZhmZxoVAsgotZo50gj6M/Educador-Financeiro---DIO?node-id=29-403&t=Cv4vW38VUtwwLO3Z-1).

## Demonstração

Este fork ainda não tem uma versão publicada. Para testar, siga as instruções da seção [Como executar](#como-executar) e rode o projeto localmente.

<!-- Ao publicar o projeto (Vercel, Netlify, etc.), adicione aqui o link da demonstração ao vivo. -->

## Tecnologias utilizadas

| Tecnologia | Função no projeto |
| --- | --- |
| [React 19](https://react.dev/) | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Vite](https://vite.dev/) | Build tool e servidor de desenvolvimento |
| [React Router](https://reactrouter.com/) | Roteamento client-side (SPA) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização utilitária |
| [react-loading-skeleton](https://www.npmjs.com/package/react-loading-skeleton) | Skeleton do estado de carregamento |
| [lucide-react](https://lucide.dev/) | Ícones |
| [Google Gemini API](https://ai.google.dev/) | Geração do diagnóstico financeiro (IA generativa) |
| ESLint + Prettier | Padronização e qualidade de código |

## Como executar

O projeto usa [pnpm](https://pnpm.io/) como gerenciador de pacotes (é o que está configurado no `pnpm-lock.yaml`).

```bash
git clone https://github.com/gabriel-r-silvaa/planejai.git
cd planejai
pnpm install
```

A geração dos insights depende de uma chave da API do Google Gemini. Copie o arquivo de exemplo e preencha com a sua chave (crie uma em [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)):

```bash
cp env.example .env.local
```

```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

Com o `.env.local` configurado, inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Outros comandos disponíveis:

```bash
pnpm build    # build de produção (roda o TypeScript e gera a pasta dist/)
pnpm lint     # roda o ESLint no projeto
pnpm preview  # serve o build de produção localmente
```

## Problemas comuns com a API do Gemini

### Erro 503: Service Unavailable

O status HTTP `503` significa que o serviço do Gemini estava temporariamente indisponível no momento da requisição. Isso pode acontecer por sobrecarga momentânea da API, instabilidade do modelo ou manutenção do serviço. Em geral, não indica um erro nos dados preenchidos no formulário.

O serviço da aplicação faz até três tentativas automáticas para erros temporários (`429`, `500`, `502`, `503` e `504`), com uma espera progressiva entre elas. Se o Gemini continuar indisponível, o card exibe o erro e oferece o botão **Tentar novamente**.

Para investigar um erro ao executar localmente:

1. Confirme que existe um arquivo `.env.local` na raiz do projeto.
2. Confirme que a variável está preenchida, sem aspas ou espaços extras:

	```dotenv
	VITE_GEMINI_API_KEY=sua_chave_aqui
	```

3. Reinicie o servidor depois de alterar `.env.local`, pois o Vite carrega as variáveis ao iniciar.
4. Confira se a chave está ativa e se a API Generative Language está disponível no [Google AI Studio](https://aistudio.google.com/app/apikey).
5. Se o erro for `503`, aguarde alguns segundos e use **Tentar novamente**. Se persistir, verifique o status do serviço e os limites da sua chave.

Nunca versione `.env.local` nem publique a chave da API. Variáveis com prefixo `VITE_` são incluídas no código do navegador; para uma aplicação pública, o ideal é mover a chamada ao Gemini para um backend ou função serverless.

## Melhoria implementada: experiência de carregamento e erro

O card de insight da IA (`AIInsightsCard`) já vinha, da base do curso, com uma estrutura de estados razoavelmente sólida: um `Skeleton` durante o carregamento, uma mensagem de erro com botão de "Tentar novamente" quando a chamada à IA falhava, e o conteúdo do diagnóstico quando tudo dava certo. O desafio deste fork não foi criar esses estados do zero, e sim auditar essa implementação e melhorar os pontos que ainda deixavam a experiência incompleta.

**O que foi identificado na auditoria:**

- Entre o momento em que o card montava e o momento em que o `useEffect` de `useInsight` disparava a primeira busca, `isLoading` ainda valia `false` e não havia `insight` nem `error`. Nesse instante, o card não exibia nada visualmente, além do cabeçalho: nem skeleton, nem erro, nem conteúdo.
- Nenhum dos estados (carregando, erro) tinha qualquer marcação de acessibilidade. Um leitor de tela não era avisado quando o conteúdo começava a carregar ou quando um erro aparecia.
- Havia um `console.log(insight)` esquecido no componente, sobrando de alguma sessão de debug.
- Fora do card de insight, a página de resultados tinha outro ponto sem tratamento: quando o `id` da simulação na URL não correspondia a nenhum registro salvo, a página só renderizava um parágrafo simples (`<p>Simulação não encontrada.</p>`), sem nenhuma ação para o usuário seguir em frente.

**O que foi feito:**

1. **Eliminado o instante sem feedback visual.** Em `AIInsightCardProps.tsx`, o momento de exibir o skeleton passou a ser calculado por um valor derivado, `showSkeleton`, que é `true` tanto durante o carregamento quanto no instante inicial em que ainda não existe `insight` nem `error` (ou seja, quando uma busca está prestes a começar). Isso fecha a lacuna sem tocar na lógica de disparo da requisição em `useInsight`, que já tinha um cuidado explícito para evitar chamadas duplicadas à API do Gemini.
2. **Acessibilidade nos estados de carregamento e erro.** O container do skeleton ganhou `role="status"` com um texto para leitor de tela ("Gerando seu diagnóstico financeiro..."), e o componente `Error` ganhou `role="alert"`, para que a mudança de estado seja anunciada por tecnologias assistivas assim que acontece.
3. **Tratamento do outro ponto sem feedback do fluxo.** O fallback de "simulação não encontrada" em `SimulationResultsPage.tsx` passou a usar o mesmo padrão visual do restante do app (`PageHero`) e ganhou um botão que leva o usuário de volta para iniciar uma nova simulação, em vez de deixá-lo num beco sem saída.
4. **Limpeza.** O `console.log` esquecido foi removido.

**Como a experiência funciona hoje:** ao entrar na página de resultados, o skeleton aparece imediatamente. Enquanto a IA processa a simulação, o usuário vê um indicador claro de carregamento. Se a chamada à API falhar (rede instável, chave inválida, resposta inesperada da IA), a mensagem de erro aparece junto com um botão para tentar de novo, sem nunca deixar a tela travada ou sem retorno. Quando o diagnóstico é gerado com sucesso, ele substitui o skeleton diretamente.

## Fluxo principal

1. O usuário acessa a aplicação e preenche um formulário em 6 etapas: renda mensal bruta, custos fixos de vida, dívidas/parcelas, nome da meta, custo da meta e prazo desejado.
2. Ao concluir a última etapa, a simulação é salva no `localStorage` com um ID único e o usuário é redirecionado para `/resultado/:id`.
3. A página de resultados exibe imediatamente os números calculados (custo da meta, prazo, economia mensal necessária) e o card de insight entra em estado de carregamento.
4. Em segundo plano, a aplicação monta um prompt com os dados da simulação e chama a API do Google Gemini.
5. Se a resposta chegar com sucesso, o card exibe o diagnóstico: viabilidade da meta, diagnóstico financeiro, sugestões práticas, ideias de renda extra, sugestões de investimento e uma mensagem final.
6. Se algo falhar nesse processo, o card exibe uma mensagem de erro clara com um botão para tentar novamente, sem perder os dados já preenchidos.
7. Se o usuário acessar uma URL de resultado com um ID que não existe (link antigo, `localStorage` limpo etc.), a página exibe um estado dedicado explicando o problema e oferece um botão para iniciar uma nova simulação.

## Como testar

Depois de rodar `pnpm dev` com o `.env.local` configurado, o teste manual mais direto é preencher o formulário até o fim e observar a página de resultados.

### Estado de loading

Ao ser redirecionado para `/resultado/:id`, o skeleton do card de insight já deve aparecer no primeiro instante da tela, sem nenhum frame em branco antes dele. Ele permanece visível até a resposta da IA chegar.

### Estado de sucesso

Com uma chave de API válida no `.env.local`, o skeleton deve dar lugar ao diagnóstico completo (viabilidade da meta, diagnóstico, sugestões, renda extra, investimento e mensagem final) em poucos segundos.

### Estado de erro

Para reproduzir o erro de forma segura, sem alterar código, há duas opções:

- Definir uma chave inválida em `VITE_GEMINI_API_KEY` no `.env.local` e reiniciar o `pnpm dev`. A API do Gemini responde com erro e a aplicação cai no fluxo de erro.
- Com o DevTools do navegador aberto, na aba *Network*, bloquear requisições para `generativelanguage.googleapis.com` antes de enviar o formulário.

Em ambos os casos, o card deve trocar o skeleton pela mensagem de erro com o botão "Tentar novamente", sem nenhum `console.error` cru nem tela em branco.

### Retry

Ainda no estado de erro, clicar em "Tentar novamente" deve voltar o card para o estado de carregamento e disparar uma nova chamada à IA. Corrigindo a causa do erro (por exemplo, restaurando a chave de API válida e reiniciando o servidor) antes de clicar em retry, o diagnóstico deve aparecer normalmente.

### Simulação não encontrada

Acessar uma URL como `/resultado/id-que-nao-existe` deve exibir o estado dedicado de "Simulação não encontrada", com um botão para iniciar uma nova simulação.

## O que aprendi

Esse desafio me fez prestar atenção em detalhes de estado assíncrono em React que não são óbvios só de olhar o código funcionando. Aprendi que "funciona" e "está sem lacunas" são coisas diferentes: o card de insight já parecia pronto, com skeleton, erro e retry implementados, mas só rastreando o ciclo de vida do componente (o que `isLoading` vale antes do `useEffect` rodar, e por quanto tempo) percebi o instante sem feedback visual entre a montagem e o início do carregamento.

Também entendi na prática por que `isRequestPending` (uma `ref`, não um `state`) era necessário em `useInsight`: como o hook `useSimulationStorage` recria suas funções a cada render, o `useCallback` de `fetchInsight` também muda de referência com frequência, o que faz o `useEffect` rodar de novo em vários momentos. Só a `ref`, que não depende de re-render para ser lida, garante que a busca não dispare em duplicidade. Entender esse mecanismo antes de mexer no componente foi o que me fez decidir não alterar `useInsight.tsx`: dava para resolver o problema de forma só visual, em `AIInsightCardProps.tsx`, sem correr o risco de quebrar essa proteção contra chamadas duplicadas à API.

Trabalhar com carregamento e erro também me aproximou de acessibilidade de um jeito mais concreto: `role="status"` e `role="alert"` existem exatamente para esse tipo de situação, em que o conteúdo da tela muda sem o usuário ter clicado em nada, e sem eles um leitor de tela simplesmente não percebe que algo aconteceu.

Por fim, ficou claro o valor de auditar antes de implementar. Se eu tivesse partido direto para escrever loading e erro sem checar o que já existia, teria duplicado uma lógica que já estava lá e ainda corria o risco de deixar passar o `console.log` esquecido e o outro estado sem tratamento na página de resultados.

## Evolução do projeto

**Antes**
- Loading e erro do card de insight já existiam, mas com um instante sem nenhum feedback visual logo após a página montar.
- Nenhuma marcação de acessibilidade nos estados de carregamento e erro.
- `console.log` de debug esquecido no componente.
- Página de resultados sem tratamento algum para "simulação não encontrada" (parágrafo simples, sem estilo, sem ação para o usuário).

**Depois**
- Skeleton aparece desde o primeiro frame, sem lacuna visual.
- `role="status"` no carregamento e `role="alert"` no erro.
- Código limpo, sem logs de depuração.
- Estado de "simulação não encontrada" com visual consistente com o resto do app e um caminho claro de volta.

## Prints e evidências

<!-- Adicionar aqui um screenshot do formulário de simulação -->

<!-- Adicionar aqui um screenshot do estado de carregamento (skeleton) -->

<!-- Adicionar aqui um screenshot do estado de erro, com o botão "Tentar novamente" -->

<!-- Adicionar aqui um screenshot do resultado com o diagnóstico gerado -->

<!-- Adicionar aqui um screenshot do estado de "simulação não encontrada" -->

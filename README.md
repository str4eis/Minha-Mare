# Minha Maré

Aplicativo web de precificação e controle financeiro para marisqueiras, feito em **Next.js 14 (App Router)**, **TypeScript** e **Tailwind CSS**.

## Telas

- **/** — Boas-vindas / onboarding
- **/home** — Início (resumo do mês, atalhos, meta de aposentadoria, vendas recentes)
- **/vendas** — Lista de vendas + botão para nova venda
- **/vendas/nova** — Registrar venda (categoria, quantidade, valor)
- **/gastos** — Gastos da Pesca / Gastos da Casa (abas + categorias + lançamentos)
- **/gastos/novo** — Registrar gasto
- **/resultados** — Totais do mês, resultado final, exportar e compartilhar

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Build de produção

```bash
npm run build
npm start
```

## Dados

Os dados (vendas, gastos) ficam salvos no `localStorage` do navegador — ainda não há
backend nem sincronização entre dispositivos. O app inicia sem lançamentos de exemplo;
os dados adicionados persistem entre sessões no mesmo navegador.

Os totais e o resumo consideram o mês selecionado no fuso `America/Recife`. Use as setas
do seletor mensal para consultar meses anteriores; o mês futuro não pode ser selecionado.

Se o conteúdo salvo estiver corrompido, o app preserva uma cópia em
`minha-mare:v1:backup` e mantém a chave original até um novo lançamento ser registrado.

## Testes

```bash
npm run lint
npm test
```

## Stack

- Next.js 14 (App Router, client components)
- TypeScript
- Tailwind CSS (tokens de cor customizados em `tailwind.config.ts`)
- lucide-react (ícones)
- Fontes auto-hospedadas via `@fontsource/poppins` e `@fontsource/fraunces`

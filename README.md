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

Os dados (vendas, gastos) ficam salvos no `localStorage` do navegador — não há backend.
Um conjunto de dados de exemplo é carregado na primeira visita; tudo que você adicionar
fica salvo automaticamente e persiste entre sessões no mesmo navegador.

## Stack

- Next.js 14 (App Router, client components)
- TypeScript
- Tailwind CSS (tokens de cor customizados em `tailwind.config.ts`)
- lucide-react (ícones)
- Fontes auto-hospedadas via `@fontsource/poppins` e `@fontsource/fraunces`

# Minha Maré

Aplicativo web de controle financeiro para marisqueiras, feito em **Next.js 15.5**,
**React 18**, **TypeScript** e **Tailwind CSS**. O acesso é feito com e-mail e senha;
vendas, gastos e perfil são armazenados no Supabase, vinculados à usuária autenticada.

## Telas

- **/** — Boas-vindas, cadastro ou acesso à conta
- **/home** — Resumo do mês e lançamentos recentes
- **/perfil** — Dados pessoais, meta de aposentadoria, saída e exclusão da conta
- **/vendas** e **/gastos** — Histórico mensal, filtros, edição e exclusão
- **/resultados** — Totais e resultado do mês
- **/login**, **/cadastro**, **/recuperar-senha** e **/redefinir-senha** — Autenticação

## Configuração local

1. Instale as dependências e crie as variáveis locais:

   ```bash
   npm install
   cp .env.example .env.local
   ```

2. No painel do Supabase, abra **Project Settings → API** e copie a **Project URL** e
   a chave pública **anon** para `.env.local`. Projetos Supabase que já usam a chave
   pública nova também podem configurá-la como
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

3. Configure **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` durante o desenvolvimento (use o domínio do
     app em produção).
   - **Redirect URLs**: inclua `http://localhost:3000/auth/callback` e a URL
     correspondente do ambiente publicado.

4. Inicie o Next.js:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000.

> **Segredo:** `SUPABASE_SERVICE_ROLE_KEY` é somente para servidor. Nunca use o
> prefixo `NEXT_PUBLIC_` nessa variável, nunca a importe em componentes client e
> nunca a envie ao front-end ou ao repositório. Configure-a localmente apenas no
> `.env.local` e, em produção, no gerenciador de variáveis/segredos da plataforma de
> hospedagem. A chave é usada exclusivamente pela rota server-side de exclusão de
> conta; vendas, gastos e perfil continuam protegidos por RLS.

## Banco de dados e migration

No painel do Supabase, crie um **New project**, escolha a organização, nome, senha do
banco e região. A estrutura local da CLI e a migration inicial ficam em `supabase/`.

Para aplicar a migration manualmente:

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```

O comando `link` pede a senha do banco de dados do projeto. Revise o SQL antes de
aplicar a migration. Ela cria `profiles`, `sales` e `expenses`, ativa RLS e limita cada
operação ao `auth.uid()` da usuária autenticada. O app não usa a chave `service_role`.

## Build e testes

```bash
npm run build
npm run lint
npm test
```

## Stack

- Next.js 15.5 (App Router e middleware)
- React 18 e TypeScript
- Supabase Auth, Postgres e Row Level Security
- Tailwind CSS (tokens `mare-*` em `tailwind.config.ts`)
- lucide-react
- Fontes auto-hospedadas via `@fontsource/poppins` e `@fontsource/fraunces`

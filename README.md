
# AutoIntel AI - Deploy Guide

Para que a IA e o Chat funcionem no Vercel, você deve configurar as Variáveis de Ambiente no painel do projeto.

## Passo-a-passo para Vercel

1. **Suba seu código para o GitHub** (certifique-se de que o `package.json` e `vite.config.ts` estão na raiz).
2. No painel da **Vercel**, clique em **"Add New"** > **"Project"**.
3. Importe seu repositório.
4. Antes de clicar em Deploy, abra a seção **"Environment Variables"**.
5. Adicione as seguintes chaves exatamente com estes nomes:

| Nome da Variável | Onde encontrar |
| :--- | :--- |
| `API_KEY` | [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey) |
| `VITE_SUPABASE_URL` | Configurações do seu projeto Supabase > API |
| `VITE_SUPABASE_ANON_KEY` | Configurações do seu projeto Supabase > API > anon public |

6. Clique em **Deploy**.

## Configuração do Banco de Dados (Supabase)

Para que a funcionalidade de salvar relatórios e histórico funcione corretamente, vá até o **SQL Editor** do seu projeto no Supabase e execute o seguinte comando para criar a tabela necessária:

```sql
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  brand text,
  model text,
  version text,
  year text,
  km text,
  score numeric,
  report_data jsonb
);

-- Opcional: Habilitar RLS (Row Level Security) para segurança
alter table public.reports enable row level security;

create policy "Usuários podem ver apenas seus próprios relatórios"
on public.reports for select
using ( auth.uid() = user_id );

create policy "Usuários podem criar seus próprios relatórios"
on public.reports for insert
with check ( auth.uid() = user_id );
```

## Por que isso é necessário?
Diferente do ambiente local, o navegador não tem acesso direto às chaves por segurança. Durante o build na Vercel, o Vite lê essas variáveis e as "escreve" no código final que será entregue ao usuário, permitindo que as chamadas à API do Gemini e ao Supabase funcionem.

## Desenvolvimento Local
1. Crie um arquivo chamado `.env.local` na raiz.
2. Adicione as mesmas variáveis acima.
3. Rode `npm install` e `npm run dev`.

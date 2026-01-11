
# AutoIntel AI - Configuração do Banco de Dados (Supabase)

Se você vir o erro "Could not find the table in the schema cache", siga os passos abaixo:

### 1. Script SQL de Limpeza e Criação
Copie e cole este código no **SQL Editor** do seu projeto Supabase para garantir que as tabelas e permissões (RLS) estejam corretas:

```sql
-- 1. LIMPEZA (OPCIONAL - APAGA TUDO PARA RECOMEÇAR DO ZERO)
-- drop table if exists public.reports cascade;
-- drop table if exists public.chat_history cascade;

-- 2. TABELA DE LAUDOS (REPORTS)
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  brand text,
  model text,
  year text,
  km text,
  score numeric,
  report_data jsonb
);

-- Habilitar RLS para Reports
alter table public.reports enable row level security;
create policy "Users can see own reports" on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.reports for insert with check (auth.uid() = user_id);

-- 3. TABELA DE HISTÓRICO DE CHAT (CHAT_HISTORY)
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()),
  user_id uuid references auth.users not null,
  title text,
  messages jsonb
);

-- Habilitar RLS para Chat
alter table public.chat_history enable row level security;
create policy "Users can see own chats" on public.chat_history for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on public.chat_history for insert with check (auth.uid() = user_id);
create policy "Users can update own chats" on public.chat_history for update using (auth.uid() = user_id);
```

### 2. Dica para o Erro de "Schema Cache"
Após rodar o SQL, se o erro persistir:
1. Vá em **Settings** -> **API**.
2. Altere qualquer configuração simples e salve (isso força o PostgREST a recarregar o esquema).
3. Ou simplesmente aguarde 60 segundos e limpe o cache do navegador.

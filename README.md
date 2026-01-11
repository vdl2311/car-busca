
# AutoIntel AI - Configuração do Banco de Dados (Supabase)

Para que o aplicativo funcione corretamente e pare de exibir o erro "Could not find the table in the schema cache", você deve executar o script abaixo no **SQL Editor** do seu painel do Supabase.

### Passo a Passo:
1. Entre no [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione seu projeto.
3. Clique no ícone **SQL Editor** na barra lateral esquerda.
4. Clique em **New Query**.
5. Cole o código abaixo e clique em **Run**.

```sql
-- 1. CRIAR TABELA DE LAUDOS (REPORTS)
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

-- Habilitar RLS (Segurança de Linha) para Reports
alter table public.reports enable row level security;
create policy "Usuários podem ver seus próprios laudos" on public.reports for select using (auth.uid() = user_id);
create policy "Usuários podem inserir seus próprios laudos" on public.reports for insert with check (auth.uid() = user_id);

-- 2. CRIAR TABELA DE HISTÓRICO DE CHAT (CHAT_HISTORY)
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
create policy "Usuários podem ver seus próprios chats" on public.chat_history for select using (auth.uid() = user_id);
create policy "Usuários podem inserir seus próprios chats" on public.chat_history for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar seus próprios chats" on public.chat_history for update using (auth.uid() = user_id);
```

### Por que o erro acontece?
O Supabase utiliza um cache para o esquema do banco de dados. Se as tabelas não forem criadas fisicamente, o backend do Supabase (PostgREST) não as encontrará, gerando o erro de cache. Rodar este script cria as tabelas e limpa o cache automaticamente.

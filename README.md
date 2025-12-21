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

## Por que isso é necessário?
Diferente do ambiente local, o navegador não tem acesso direto às chaves por segurança. Durante o build na Vercel, o Vite lê essas variáveis e as "escreve" no código final que será entregue ao usuário, permitindo que as chamadas à API do Gemini e ao Supabase funcionem.

## Desenvolvimento Local
1. Crie um arquivo chamado `.env.local` na raiz.
2. Adicione as mesmas variáveis acima.
3. Rode `npm install` e `npm run dev`.
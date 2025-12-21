
# AutoIntel AI

Plataforma inteligente de análise veicular.

## Como fazer o Deploy

### 1. GitHub
Suba os arquivos para um repositório no GitHub (exceto as pastas no `.gitignore`).

### 2. Vercel
1. No dashboard da Vercel, clique em "Add New" > "Project".
2. Importe o repositório do GitHub.
3. Em **Environment Variables**, adicione:
   - `API_KEY`: Sua chave da API do Google Gemini.
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu Supabase.
4. Clique em "Deploy".

## Desenvolvimento Local
```bash
npm install
npm run dev
```

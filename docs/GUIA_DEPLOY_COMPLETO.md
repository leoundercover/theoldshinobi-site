# 🚀 GUIA COMPLETO DE DEPLOY - THE OLD SHINOBI

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Backend (API Node.js)](#configuração-do-backend)
4. [Configuração do Frontend (React)](#configuração-do-frontend)
5. [Deploy em Produção](#deploy-em-produção)
6. [Configurações Adicionais](#configurações-adicionais)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### Software Necessário
- ✅ Node.js 18+ e npm/pnpm
- ✅ Git
- ✅ Conta no Supabase (gratuita)
- ✅ Servidor web (Nginx, Apache, ou serviço de hosting)

### Conhecimentos Recomendados
- Básico de terminal/linha de comando
- Conceitos de API REST
- PostgreSQL básico

---

## 🗄️ Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name:** the-old-shinobi
   - **Database Password:** (crie uma senha forte)
   - **Region:** Escolha a mais próxima do seu público
5. Clique em "Create new project"
6. Aguarde 2-3 minutos para o projeto ser criado

### Passo 2: Executar o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Aguarde a execução (pode levar 30-60 segundos)
7. Verifique se não há erros na aba "Results"

### Passo 3: Verificar Tabelas Criadas

1. Vá em **Table Editor** (menu lateral)
2. Você deve ver 7 tabelas:
   - users
   - publishers
   - titles
   - issues
   - ratings
   - favorites
   - reading_history

### Passo 4: Obter Credenciais

1. Vá em **Settings** → **API** (menu lateral)
2. Anote as seguintes informações:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (chave pública)
   - **service_role key:** `eyJhbGc...` (chave privada - use apenas no backend)

### Passo 5: Configurar Storage (para PDFs e Imagens)

1. Vá em **Storage** (menu lateral)
2. Clique em "Create a new bucket"
3. Crie 2 buckets:

**Bucket 1: covers**
- Name: `covers`
- Public: ✅ (marcado)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

**Bucket 2: pdfs**
- Name: `pdfs`
- Public: ✅ (marcado)
- File size limit: 50 MB
- Allowed MIME types: `application/pdf`

4. Para cada bucket, vá em "Policies" e crie:

**Policy para leitura pública:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'covers' ); -- ou 'pdfs'
```

**Policy para upload (apenas autenticados):**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND -- ou 'pdfs'
  auth.role() = 'authenticated'
);
```

### Passo 6: Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** (já deve estar habilitado)
3. Configure:
   - **Enable Email Confirmations:** ❌ (desabilite para desenvolvimento)
   - **Enable Email OTP:** ❌ (opcional)
4. Vá em **Authentication** → **URL Configuration**
5. Configure:
   - **Site URL:** `https://seudominio.com` (seu domínio em produção)
   - **Redirect URLs:** Adicione:
     - `http://localhost:5173/*` (desenvolvimento)
     - `https://seudominio.com/*` (produção)

---

## 🔧 Configuração do Backend (API Node.js)

### Passo 1: Extrair Arquivos

```bash
# Extrair o arquivo do backend
tar -xzf revista-cms-api.tar.gz
cd revista-cms-api
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env`:
```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados (Supabase)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha_do_supabase
DB_SSL=true

# JWT
JWT_SECRET=gere_uma_chave_secreta_forte_aqui_min_32_caracteres
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica_anon
SUPABASE_SERVICE_KEY=sua_chave_privada_service_role

# URLs
FRONTEND_URL=https://seudominio.com
API_URL=https://api.seudominio.com

# Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/webp
```

**Como gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 4: Atualizar Configuração do Banco

Edite `src/config/database.js` para usar Supabase:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

### Passo 5: Testar Conexão

```bash
# Testar se a API conecta ao banco
npm run dev

# Você deve ver:
# Server running on port 3000
# Database connected successfully
```

### Passo 6: Deploy da API

**Opção A: VPS/Servidor Próprio (com PM2)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar a API
pm2 start src/index.js --name "theoldshinobi-api"

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

**Opção B: Heroku**

```bash
# Login no Heroku
heroku login

# Criar app
heroku create theoldshinobi-api

# Adicionar variáveis de ambiente
heroku config:set DB_HOST=xxx
heroku config:set DB_PASSWORD=xxx
# ... (todas as variáveis do .env)

# Deploy
git push heroku main
```

**Opção C: Railway/Render**

1. Conecte seu repositório Git
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático

### Passo 7: Configurar Nginx (Proxy Reverso)

Crie `/etc/nginx/sites-available/theoldshinobi-api`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/theoldshinobi-api /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 8: Configurar SSL (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.seudominio.com

# Renovação automática já está configurada
```

---

## 💻 Configuração do Frontend (React)

### Passo 1: Extrair Arquivos

```bash
# Extrair o arquivo do frontend
tar -xzf revista-portal-mvp-completo.tar.gz
cd revista-portal
```

### Passo 2: Instalar Dependências

```bash
pnpm install
# ou
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie o arquivo `.env`:

```env
# API
VITE_API_URL=https://api.seudominio.com

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_anon

# Disqus
VITE_DISQUS_SHORTNAME=theoldshinobi

# App
VITE_APP_NAME=The Old Shinobi
VITE_APP_URL=https://seudominio.com
```

### Passo 4: Atualizar Configuração da API

Crie `src/config/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Passo 5: Build para Produção

```bash
pnpm run build
# ou
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

### Passo 6: Deploy do Frontend

**Opção A: Servidor Próprio (Nginx)**

1. Copie os arquivos:
```bash
sudo cp -r dist/* /var/www/theoldshinobi/
sudo chown -R www-data:www-data /var/www/theoldshinobi
```

2. Configure Nginx (`/etc/nginx/sites-available/theoldshinobi`):

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    root /var/www/theoldshinobi;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

3. Ative e reinicie:
```bash
sudo ln -s /etc/nginx/sites-available/theoldshinobi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. SSL:
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

**Opção B: Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

**Opção C: Netlify**

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Criar arquivo netlify.toml na raiz:
```

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔐 Configurações Adicionais

### Configurar Disqus

1. Acesse [https://disqus.com](https://disqus.com)
2. Crie uma conta
3. Clique em "Get Started"
4. Escolha "I want to install Disqus on my site"
5. Preencha:
   - **Website Name:** the-old-shinobi
   - **Category:** Tech
6. Escolha o plano Free
7. Anote o **shortname** (ex: `theoldshinobi`)
8. Configure:
   - **Website URL:** `https://seudominio.com`
   - **Trusted Domains:** `seudominio.com, localhost`
9. Atualize o `.env` do frontend:
```env
VITE_DISQUS_SHORTNAME=theoldshinobi
```

### Configurar CORS na API

Edite `src/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://seudominio.com',
    'https://www.seudominio.com'
  ],
  credentials: true
}));
```

### Configurar Upload de Arquivos

Instale o cliente do Supabase na API:

```bash
npm install @supabase/supabase-js
```

Crie `src/services/storage.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadCover(file, fileName) {
  const { data, error } = await supabase.storage
    .from('covers')
    .upload(fileName, file, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('covers')
    .getPublicUrl(fileName);

  return publicUrl;
}

async function uploadPDF(file, fileName) {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(fileName);

  return publicUrl;
}

module.exports = { uploadCover, uploadPDF };
```

---

## 🔍 Troubleshooting

### Problema: Páginas internas retornam 404

**Solução:** Verifique se o arquivo `_redirects` está na pasta `dist/`:

```bash
# Deve conter:
/*    /index.html   200
```

Se estiver usando Nginx, verifique a configuração:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: CORS error na API

**Solução:** Configure CORS corretamente:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Problema: Conexão com Supabase falha

**Solução:** Verifique:
1. URL do projeto está correta
2. Chaves API estão corretas
3. RLS (Row Level Security) está configurado
4. Firewall não está bloqueando

### Problema: Upload de arquivos falha

**Solução:**
1. Verifique se os buckets foram criados
2. Verifique as policies de storage
3. Verifique o tamanho máximo do arquivo
4. Verifique os MIME types permitidos

### Problema: Autenticação não funciona

**Solução:**
1. Verifique JWT_SECRET no .env
2. Verifique se o token está sendo enviado no header
3. Verifique se as policies RLS estão corretas
4. Limpe localStorage e tente novamente

---

## 📊 Checklist de Deploy

### Backend
- [ ] Supabase configurado
- [ ] Schema SQL executado
- [ ] Tabelas criadas
- [ ] Storage buckets criados
- [ ] Variáveis de ambiente configuradas
- [ ] API rodando
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] PM2 configurado (se VPS)

### Frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Build gerado (`dist/`)
- [ ] Arquivo `_redirects` presente
- [ ] Deploy realizado
- [ ] SSL configurado
- [ ] Domínio apontando corretamente

### Integrações
- [ ] Disqus configurado
- [ ] CORS configurado
- [ ] Upload de arquivos funcionando
- [ ] Autenticação funcionando

### Testes
- [ ] Página inicial carrega
- [ ] Navegação entre páginas funciona
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Favoritos funcionam
- [ ] Busca funciona
- [ ] Leitor de PDF funciona
- [ ] Painel admin acessível

---

## 🎉 Deploy Completo!

Após seguir todos os passos, seu portal estará:

✅ Rodando em produção  
✅ Com banco de dados configurado  
✅ Com autenticação funcionando  
✅ Com upload de arquivos  
✅ Com SSL/HTTPS  
✅ Com comentários (Disqus)  
✅ Totalmente funcional  

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs:
   - Backend: `pm2 logs theoldshinobi-api`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Supabase: Dashboard → Logs

2. Consulte a documentação:
   - Supabase: https://supabase.com/docs
   - React: https://react.dev
   - Node.js: https://nodejs.org/docs

3. Issues comuns estão no Troubleshooting acima

---

**Boa sorte com o deploy! 🚀**

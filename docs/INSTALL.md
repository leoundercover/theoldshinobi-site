# 🚀 Guia de Instalação - The Old Shinobi

Sistema de Gerenciamento de Quadrinhos e Revistas

---

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Automática](#instalação-automática)
3. [Instalação Manual](#instalação-manual)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Executando a Aplicação](#executando-a-aplicação)
6. [Criando Usuário Admin](#criando-usuário-admin)
7. [Solução de Problemas](#solução-de-problemas)

---

## ⚙️ Requisitos do Sistema

### Obrigatórios:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (local ou Supabase)

### Recomendados:

- **Git** (para controle de versão)
- **curl** (para testes de API)
- **PostgreSQL 14+** (se usar local)

### Verificar Requisitos:

```bash
./scripts/install.sh
# Selecione opção 4: "Apenas verificar requisitos"
```

Ou manualmente:

```bash
node -v    # Deve ser >= 18.0.0
npm -v     # Deve ser >= 9.0.0
psql --version  # Opcional se usar Supabase
```

---

## 🚀 Instalação Automática (Recomendado)

### Método 1: Instalação Completa

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd theoldshinobi-site

# 2. Execute o script de instalação
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Selecione opção 1: "Instalação completa"
```

O script irá:
- ✅ Verificar requisitos do sistema
- ✅ Instalar dependências do backend
- ✅ Instalar dependências do frontend
- ✅ Configurar variáveis de ambiente
- ✅ Testar conexão com banco de dados

### Método 2: Instalação Seletiva

```bash
./scripts/install.sh
# Opção 2: Apenas Backend
# Opção 3: Apenas Frontend
```

---

## 🛠️ Instalação Manual

### Backend (API REST)

```bash
# 1. Navegue para o diretório do backend
cd revista-cms-api

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de exemplo
cp .env.example .env

# 4. Edite o .env com suas configurações
nano .env

# 5. Gere um JWT_SECRET forte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 6. Cole o JWT_SECRET no .env
```

#### Configuração do .env (Backend):

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados (Supabase)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_SSL=true

# JWT
JWT_SECRET=seu_jwt_secret_gerado_acima
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
FILES_BASE_URL=http://localhost:3000/uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Bcrypt
BCRYPT_SALT_ROUNDS=12
```

### Frontend (Next.js)

```bash
# 1. Navegue para o diretório do frontend
cd revista-portal

# 2. Instale as dependências
npm install

# 3. Crie o arquivo .env.local
nano .env.local
```

#### Configuração do .env.local (Frontend):

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: Supabase (Recomendado)

#### 1. Criar Projeto no Supabase:

1. Acesse: https://app.supabase.com
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Escolha um nome e senha forte
5. Aguarde a criação do projeto (~2 minutos)

#### 2. Obter Credenciais:

1. Vá em **Settings** → **Database**
2. Encontre a seção **Connection String**
3. Copie a **Connection string** (modo Transaction)
4. A string terá este formato:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

#### 3. Executar Schema SQL:

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `supabase-schema.sql` do projeto
4. Copie todo o conteúdo
5. Cole no editor SQL do Supabase
6. Clique em **Run**

✅ Isso criará:
- 7 tabelas (users, publishers, titles, issues, ratings, favorites, reading_history)
- 15 índices para performance
- 7 triggers automáticos
- 3 functions (atualização de ratings)
- 2 views (estatísticas)
- Políticas RLS (segurança)
- Dados de exemplo

### Opção 2: PostgreSQL Local

#### 1. Instalar PostgreSQL:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Baixe de: https://www.postgresql.org/download/windows/

#### 2. Criar Banco:

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE revista_cms;
CREATE USER revista_user WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE revista_cms TO revista_user;
\q
```

#### 3. Executar Schema:

```bash
psql -U revista_user -d revista_cms -f supabase-schema.sql
```

---

## ▶️ Executando a Aplicação

### Iniciar Backend:

```bash
cd revista-cms-api
npm run dev
```

**Saída esperada:**
```
✅ Nova conexão estabelecida com PostgreSQL
✅ Teste de conexão bem-sucedido
🚀 Servidor rodando na porta 3000
```

**Testar:**
```bash
curl http://localhost:3000/health
# Deve retornar: {"status":"OK","message":"API está funcionando"}
```

### Iniciar Frontend:

**Em outro terminal:**

```bash
cd revista-portal
npm run dev
```

**Saída esperada:**
```
✓ Ready in 2.1s
- Local: http://localhost:3001
```

**Acessar:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

---

## 👤 Criando Usuário Admin

### Opção 1: Script Automatizado

```bash
cd revista-cms-api
npm run create-admin
```

Siga as instruções interativas.

### Opção 2: Via API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SenhaForte@123",
    "full_name": "Administrador",
    "role": "admin"
  }'
```

**⚠️ Nota:** O campo `role` só funciona na primeira criação. Depois, use o SQL diretamente para alterar roles.

### Opção 3: Via SQL (Supabase)

```sql
-- No SQL Editor do Supabase
UPDATE users
SET role = 'admin'
WHERE email = 'seu-email@example.com';
```

---

## 🧪 Verificar Instalação

### 1. Testar Backend:

```bash
# Health check
curl http://localhost:3000/health

# Listar editoras (público)
curl http://localhost:3000/api/publishers

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SenhaForte@123"}'
```

### 2. Testar Frontend:

Acesse no navegador:
- http://localhost:3001 - Homepage
- http://localhost:3001/login - Login
- http://localhost:3001/register - Registro
- http://localhost:3001/publishers - Editoras
- http://localhost:3001/issues - Edições

---

## 🔧 Solução de Problemas

### Erro: "Cannot find module"

```bash
# Reinstale as dependências
cd revista-cms-api && npm install
cd revista-portal && npm install
```

### Erro: "Port 3000 already in use"

```bash
# Encontre o processo usando a porta
lsof -i :3000
# Ou
netstat -ano | findstr :3000  # Windows

# Mate o processo
kill -9 <PID>
```

### Erro: "Connection refused" (Banco)

**Verifique:**
1. Credenciais no `.env` estão corretas
2. Supabase está online
3. SSL está configurado (`DB_SSL=true`)
4. IP está permitido no Supabase (Settings → Database → Connection pooling)

**Testar conexão:**
```bash
psql "postgresql://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres"
```

### Erro: "JWT secret not configured"

```bash
# Gere um novo secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cole no .env
JWT_SECRET=o_valor_gerado_acima
```

### Erro: Tailwind não compila (Frontend)

```bash
cd revista-portal
npm install @tailwindcss/postcss
```

Verifique `postcss.config.js`:
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### Frontend não acessa API

**Verifique:**
1. Backend está rodando: `curl http://localhost:3000/health`
2. CORS configurado: `ALLOWED_ORIGINS` no `.env` do backend
3. URL no `.env.local` do frontend: `NEXT_PUBLIC_API_URL=http://localhost:3000`

---

## 📦 Scripts Disponíveis

### Backend:

```bash
npm run dev          # Desenvolvimento com nodemon
npm start            # Produção
npm test             # Executar todos os testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com cobertura
npm run create-admin  # Criar usuário admin
```

### Frontend:

```bash
npm run dev          # Desenvolvimento (Turbopack)
npm run build        # Build para produção
npm start            # Servir build de produção
npm run lint         # Verificar erros de lint
```

---

## 🌐 Portas Padrão

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 📁 Estrutura do Projeto

```
theoldshinobi-site/
├── revista-cms-api/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # Controladores
│   │   ├── services/         # Lógica de negócio
│   │   ├── repositories/     # Acesso a dados
│   │   ├── middleware/       # Middlewares
│   │   ├── routes/           # Rotas da API
│   │   └── utils/            # Utilitários
│   ├── tests/                # Testes (Jest)
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
├── revista-portal/           # Frontend (Next.js 16)
│   ├── src/
│   │   ├── app/              # Páginas (App Router)
│   │   ├── components/       # Componentes React
│   │   ├── lib/              # Biblioteca (API client)
│   │   ├── stores/           # Zustand stores
│   │   └── hooks/            # Hooks customizados
│   ├── .env.local            # Variáveis de ambiente
│   └── package.json
│
├── scripts/                  # Scripts de instalação
│   ├── check-requirements.sh
│   ├── install-backend.sh
│   └── install-frontend.sh
│
├── install.sh                # Script principal
├── supabase-schema.sql       # Schema do banco
└── INSTALL.md                # Este arquivo
```

---

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ **Explore a aplicação**
   - Crie editoras, títulos e edições
   - Teste o sistema de avaliações
   - Experimente favoritar edições

2. ✅ **Leia a documentação**
   - `README.md` - Visão geral do projeto
   - `PRODUCTION_READINESS.md` - Guia de produção
   - `TESTE_LOCAL_STATUS.md` - Status dos testes

3. ✅ **Execute os testes**
   ```bash
   cd revista-cms-api
   npm test
   ```

4. ✅ **Configure para produção**
   - Veja `PRODUCTION_READINESS.md`
   - Configure CI/CD
   - Configure domínio e SSL

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique a seção [Solução de Problemas](#solução-de-problemas)
2. Consulte os arquivos de documentação
3. Verifique os logs:
   - Backend: Console do terminal
   - Frontend: Console do navegador (F12)
   - Banco: SQL Editor do Supabase

---

## ✅ Checklist de Instalação

- [ ] Node.js >= 18 instalado
- [ ] npm >= 9 instalado
- [ ] Repositório clonado
- [ ] Dependências do backend instaladas
- [ ] Dependências do frontend instaladas
- [ ] Arquivo .env configurado (backend)
- [ ] Arquivo .env.local configurado (frontend)
- [ ] Projeto Supabase criado
- [ ] SQL executado no Supabase
- [ ] Backend iniciado sem erros
- [ ] Frontend iniciado sem erros
- [ ] Health check respondendo
- [ ] Usuário admin criado
- [ ] Login testado
- [ ] Aplicação funcionando

---

**🎉 Parabéns! Sua aplicação está instalada e pronta para uso!**

Para mais informações, consulte:
- `README.md` - Documentação principal
- `CONFIGURACAO_BANCO_DADOS.md` - Detalhes do banco
- `TESTE_LOCAL_STATUS.md` - Status dos testes

# THE OLD SHINOBI - Sistema de Gerenciamento de Quadrinhos

## 🚀 Início Rápido

### 1. Instalação

Execute o script de instalação:

```bash
./scripts/install.sh
```

Escolha a opção `1` (Instalação completa) e quando pedir a Connection String do Supabase, cole:

```
postgresql://postgres:y%j3Wmu#SUNURa7@db.fpoaamklucjhfnqztxec.supabase.co:5432/postgres
```

### 2. Iniciar Aplicação

```bash
./scripts/start.sh
```

Isso irá:
- Iniciar o backend na porta 3000
- Iniciar o frontend na porta 3001
- Salvar logs em `logs/backend.log` e `logs/frontend.log`

### 3. Acessar Aplicação

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### 4. Parar Aplicação

```bash
./scripts/stop.sh
```

### 5. Validar Sistema

```bash
./scripts/validate.sh
```

Este comando verifica:
- ✓ Estrutura de arquivos
- ✓ Dependências instaladas
- ✓ Servidores rodando
- ✓ Endpoints respondendo
- ✓ Conexão com banco de dados

## 📋 Comandos Úteis

### Ver Logs em Tempo Real

```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

### Criar Usuário Admin

```bash
cd revista-cms-api
npm run create-admin
```

### Executar Testes

```bash
# Backend
cd revista-cms-api
npm test

# Frontend
cd revista-portal
npm run lint
```

## 🔧 Estrutura do Projeto

```
theoldshinobi-site/
├── revista-cms-api/      # Backend (Node.js + Express + PostgreSQL)
├── revista-portal/       # Frontend (Next.js + React)
├── scripts/              # Scripts (install, start, stop, validate)
├── docs/                 # Documentação (.md)
└── logs/                 # Logs da aplicação
```

## 🗄️ Banco de Dados

### Executar Schema SQL

1. Acesse: https://app.supabase.com/project/fpoaamklucjhfnqztxec
2. Vá em: SQL Editor
3. Cole o conteúdo de: `supabase-schema.sql`
4. Execute

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
cat logs/backend.log

# Verificar se a porta 3000 está livre
lsof -i :3000

# Limpar e reiniciar
./scripts/stop.sh
./scripts/start.sh
```

### Frontend não inicia

```bash
# Verificar logs
cat logs/frontend.log

# Verificar se a porta 3001 está livre
lsof -i :3001

# Reinstalar dependências
cd revista-portal
rm -rf node_modules
npm install
```

### Erro de conexão com banco

```bash
# Verificar configuração
cat revista-cms-api/.env

# Testar conexão
cd revista-cms-api
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(r => {console.log('OK:', r.rows[0]); process.exit(0)}).catch(e => {console.error('ERRO:', e.message); process.exit(1)})"
```

### Reconfigurar do Zero

```bash
# Parar tudo
./stop.sh

# Limpar configurações
rm -f revista-cms-api/.env
rm -f revista-portal/.env.local

# Reinstalar
./scripts/install.sh
```

## 📚 Documentação Adicional

- `INSTALL.md` - Guia de instalação detalhado
- `QUICK_START.md` - Início rápido
- `revista-cms-api/README.md` - Documentação da API
- `revista-portal/README.md` - Documentação do Frontend

## 🔐 Segurança

- Nunca commite o arquivo `.env` ou `.env.local`
- Mantenha suas credenciais do Supabase seguras
- Use senhas fortes para usuários admin

## 📞 Suporte

Em caso de problemas:

1. Execute `./scripts/validate.sh` para diagnóstico
2. Verifique os logs em `logs/`
3. Consulte a documentação adicional

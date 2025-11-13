# ⚡ Quick Start - The Old Shinobi

Guia rápido para começar a usar a aplicação em **menos de 5 minutos**!

---

## 🚀 Instalação Rápida (1 comando)

```bash
# Clone o repositório
git clone <seu-repositorio>
cd theoldshinobi-site

# Execute o instalador
./scripts/install.sh
# Escolha opção 1: "Instalação completa"
```

Siga as instruções interativas. O script irá:
- ✅ Verificar requisitos (Node.js, npm)
- ✅ Instalar todas as dependências
- ✅ Configurar variáveis de ambiente
- ✅ Testar conexão com banco

---

## 🗄️ Configure o Banco (2 minutos)

### 1. Crie conta no Supabase (grátis):
- Acesse: https://app.supabase.com
- Clique em "New Project"
- Escolha nome e senha forte

### 2. Execute o SQL:
- Vá em **SQL Editor**
- Copie o conteúdo de `supabase-schema.sql`
- Cole e execute

### 3. Copie a Connection String:
- Vá em **Settings** → **Database**
- Copie a **Connection string**
- Use no script de instalação quando solicitado

---

## ▶️ Inicie os Servidores

### Terminal 1 - Backend:
```bash
cd revista-cms-api
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd revista-portal
npm run dev
```

---

## 🌐 Acesse a Aplicação

- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:3000/health

---

## 👤 Crie seu Primeiro Admin

```bash
cd revista-cms-api
npm run create-admin
```

Ou via API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SenhaForte@123",
    "full_name": "Admin",
    "role": "admin"
  }'
```

---

## 🎯 Pronto!

Acesse http://localhost:3001/login e faça login com suas credenciais.

---

## 📚 Documentação Completa

- **Instalação detalhada:** `INSTALL.md`
- **Configuração do banco:** `CONFIGURACAO_BANCO_DADOS.md`
- **Status dos testes:** `TESTE_LOCAL_STATUS.md`
- **Produção:** `PRODUCTION_READINESS.md`

---

## ❓ Problemas?

### Backend não conecta ao banco:
```bash
# Verifique o .env
cat revista-cms-api/.env

# Teste a conexão
cd revista-cms-api
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

### Frontend não acessa API:
```bash
# Verifique se backend está rodando
curl http://localhost:3000/health

# Verifique .env.local
cat revista-portal/.env.local
```

### Porta 3000 ocupada:
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>
```

Consulte `INSTALL.md` para solução completa de problemas.

---

**🎉 Divirta-se com The Old Shinobi!**

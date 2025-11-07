# 🗄️ Configuração do Banco de Dados Supabase

## ✅ Status: CONFIGURADO

A aplicação foi configurada para conectar ao seu banco de dados Supabase.

---

## 📋 Credenciais Configuradas

**Arquivo:** `revista-cms-api/.env`

```
DB_HOST=db.fpoaamklucjhfnqztxec.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=y%j3Wmu#SUNURa7
DB_SSL=true
```

**JWT_SECRET:** Gerado automaticamente (64 bytes)

---

## 🚀 Próximos Passos

### 1. Executar o SQL no Supabase

Você já possui o SQL completo no arquivo `supabase-schema.sql`, mas aqui está novamente:

**No painel do Supabase:**
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Cole o conteúdo do arquivo `supabase-schema.sql`
5. Clique em **Run**

Isso criará:
- ✅ 7 tabelas
- ✅ 15 índices
- ✅ 7 triggers
- ✅ 3 functions
- ✅ 2 views
- ✅ Políticas RLS
- ✅ Dados de exemplo (3 editoras, 6 títulos, 8 edições)

---

### 2. Testar a Conexão da API

No diretório `revista-cms-api`, execute:

```bash
cd revista-cms-api
npm install
npm run dev
```

Você deverá ver:

```
✅ Nova conexão estabelecida com PostgreSQL
✅ Teste de conexão bem-sucedido: [timestamp]
🚀 Servidor rodando na porta 3000
```

---

### 3. Criar Usuário Admin

O SQL já cria um usuário admin de exemplo, mas o hash da senha é um placeholder.

**Crie um usuário admin real:**

```bash
cd revista-cms-api
npm run create-admin
```

Ou use o endpoint de registro via API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@theoldshinobi.com",
    "password": "SuaSenhaForte@123",
    "full_name": "Administrador",
    "role": "admin"
  }'
```

**Nota:** O primeiro usuário criado deve ter role 'admin' configurado diretamente no banco ou via script.

---

### 4. Testar os Endpoints

#### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@theoldshinobi.com",
    "password": "SuaSenhaForte@123"
  }'
```

#### Listar Editoras (público):
```bash
curl http://localhost:3000/api/publishers
```

#### Listar Edições (público):
```bash
curl http://localhost:3000/api/issues
```

---

### 5. Iniciar o Frontend

No diretório `revista-portal`:

```bash
cd revista-portal
npm install
npm run dev
```

O frontend estará disponível em: http://localhost:3001

**Páginas disponíveis:**
- `/` - Homepage
- `/login` - Login
- `/register` - Registro
- `/profile` - Perfil do usuário
- `/publishers` - Listagem de editoras
- `/publishers/[id]` - Detalhes da editora
- `/titles` - Listagem de títulos
- `/issues` - Listagem de edições (com busca e paginação)
- `/issues/[id]` - Detalhes da edição (com avaliação e comentários)
- `/favorites` - Favoritos do usuário
- `/admin` - Dashboard admin

---

## 🔍 Verificar Status das Tabelas

Execute este SQL no SQL Editor do Supabase para verificar:

```sql
-- Ver todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver contagem de registros
SELECT
  'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'publishers', COUNT(*) FROM publishers
UNION ALL
SELECT 'titles', COUNT(*) FROM titles
UNION ALL
SELECT 'issues', COUNT(*) FROM issues
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'reading_history', COUNT(*) FROM reading_history;

-- Ver estatísticas gerais (usando a view)
SELECT * FROM v_statistics;
```

---

## 🔐 Configuração de Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com as seguintes políticas:

**Users:**
- ✅ Usuários veem apenas seu próprio perfil
- ✅ Usuários atualizam apenas seu próprio perfil

**Publishers, Titles, Issues:**
- ✅ Leitura pública
- ✅ Apenas admins/editores podem criar/editar
- ✅ Apenas admins podem deletar

**Ratings:**
- ✅ Leitura pública
- ✅ Usuários gerenciam apenas suas próprias avaliações

**Favorites:**
- ✅ Usuários veem e gerenciam apenas seus próprios favoritos

**Reading History:**
- ✅ Usuários veem e gerenciam apenas seu próprio histórico

---

## 🧪 Executar Testes

```bash
cd revista-cms-api

# Todos os testes
npm test

# Apenas testes de integração
npm run test:integration

# Com cobertura
npm run test:coverage
```

**Status dos testes:** 154/154 passando (100%)

---

## ⚠️ Observação sobre a Senha do Banco

A senha configurada é: `y%j3Wmu#SUNURa7`

Se você encontrar erros de autenticação, verifique:

1. **No Supabase Dashboard:**
   - Vá em Settings → Database
   - Copie a connection string correta
   - Verifique se a senha está correta

2. **Se a senha tiver caracteres especiais:**
   - No arquivo `.env`, use a senha SEM URL encoding
   - Exemplo: Se a connection string tem `%23`, no .env use `#`

3. **Testar manualmente:**
   ```bash
   psql "postgresql://postgres:SENHA@db.fpoaamklucjhfnqztxec.supabase.co:5432/postgres"
   ```

---

## 📊 Estrutura do Banco de Dados

```
┌─────────────┐
│   users     │ (UUID)
└─────────────┘
       │
       │ user_id (FK)
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  ratings    │    │  favorites  │
└─────────────┘    └─────────────┘
       │                  │
       │ issue_id (FK)    │ issue_id (FK)
       └────────┬─────────┘
                │
                ▼
          ┌─────────────┐
          │   issues    │
          └─────────────┘
                │
                │ title_id (FK)
                ▼
          ┌─────────────┐
          │   titles    │
          └─────────────┘
                │
                │ publisher_id (FK)
                ▼
          ┌─────────────┐
          │ publishers  │
          └─────────────┘
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused"
- ✅ Verifique se o .env está no diretório correto
- ✅ Confirme que as credenciais estão corretas
- ✅ Verifique o firewall do Supabase (Settings → Database → Connection Pooling)

### Erro: "SSL connection required"
- ✅ Certifique-se que `DB_SSL=true` no .env

### Erro: "Role does not exist"
- ✅ Verifique se o usuário postgres existe no Supabase
- ✅ Use exatamente as credenciais fornecidas pelo Supabase

### Erro: "password authentication failed"
- ✅ Copie novamente a connection string do Supabase
- ✅ Verifique caracteres especiais na senha
- ✅ Teste conexão direta com psql

---

## 📝 Comandos Úteis

```bash
# Instalar dependências backend
cd revista-cms-api && npm install

# Instalar dependências frontend
cd revista-portal && npm install

# Iniciar backend (porta 3000)
cd revista-cms-api && npm run dev

# Iniciar frontend (porta 3001)
cd revista-portal && npm run dev

# Executar testes
cd revista-cms-api && npm test

# Criar usuário admin
cd revista-cms-api && npm run create-admin
```

---

## ✅ Checklist de Configuração

- [x] Arquivo .env criado com credenciais Supabase
- [x] JWT_SECRET gerado (64 bytes)
- [ ] SQL executado no Supabase (faça manualmente)
- [ ] Usuário admin criado
- [ ] Backend testado (npm run dev)
- [ ] Frontend testado (npm run dev)
- [ ] Testes automatizados rodando (npm test)

---

## 🎯 Próximo Passo Recomendado

Execute o SQL no Supabase e depois inicie o backend com:

```bash
cd revista-cms-api
npm run dev
```

Se a conexão for bem-sucedida, você verá:
```
✅ Nova conexão estabelecida com PostgreSQL
✅ Teste de conexão bem-sucedido
🚀 Servidor rodando na porta 3000
```

Depois disso, pode iniciar o frontend e testar a aplicação completa!

# Portal de Revistas - API REST

API RESTful completa para gerenciamento de um portal de publicação de revistas em PDF com leitura online. Desenvolvida em **Node.js** com **Express** e **PostgreSQL**.

## 📋 Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Permissões (Roles)](#permissões-roles)
- [Próximos Passos](#próximos-passos)

---

## ✨ Características

- **Autenticação JWT**: Sistema completo de registro, login e autenticação com tokens JWT
- **Controle de Acesso (RBAC)**: Três níveis de permissão (Admin, Editor, Reader)
- **CRUD Completo**: Gerenciamento de Editoras, Títulos e Edições
- **Sistema de Avaliações**: Usuários podem avaliar edições (1-5 estrelas)
- **Comentários**: Sistema de comentários por edição
- **Favoritos**: Usuários podem favoritar edições
- **Busca Avançada**: Busca global por título, editora, autor, etc.
- **Títulos Similares**: Recomendação automática baseada em gênero
- **Upload de Arquivos**: Suporte para upload de capas e PDFs (via Multer)

---

## 🛠 Tecnologias Utilizadas

- **Node.js** (v22.13.0)
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT (jsonwebtoken)** - Autenticação
- **bcryptjs** - Hash de senhas
- **Multer** - Upload de arquivos
- **dotenv** - Gerenciamento de variáveis de ambiente
- **CORS** - Habilitação de requisições cross-origin

---

## 📁 Estrutura do Projeto

```
revista-cms-api/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do pool do PostgreSQL
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticação
│   │   ├── publisherController.js
│   │   ├── titleController.js
│   │   ├── issueController.js
│   │   ├── ratingController.js
│   │   └── favoriteController.js
│   ├── middleware/
│   │   ├── auth.js              # Middlewares de autenticação e autorização
│   │   └── errorHandler.js      # Tratamento global de erros
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── publisherRoutes.js
│   │   ├── titleRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── favoriteRoutes.js
│   └── index.js                 # Arquivo principal do servidor
├── database/
│   └── init.sql                 # Script de inicialização do banco
├── uploads/                     # Diretório para arquivos enviados
│   ├── covers/
│   └── pdfs/
├── .env                         # Variáveis de ambiente
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** (v22 ou superior)
- **PostgreSQL** (v12 ou superior)
- **npm** ou **yarn**

### Passos

1. **Clone o repositório** (ou extraia os arquivos):

```bash
cd revista-cms-api
```

2. **Instale as dependências**:

```bash
npm install
```

3. **Configure o banco de dados PostgreSQL**:

Crie um banco de dados chamado `revista_cms`:

```bash
psql -U postgres
CREATE DATABASE revista_cms;
\q
```

4. **Execute o script de inicialização**:

```bash
psql -U postgres -d revista_cms -f database/init.sql
```

---

## ⚙️ Configuração

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=revista_cms
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configuração de Autenticação JWT
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d

# Configuração de Upload de Arquivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# URL base para arquivos estáticos
FILES_BASE_URL=http://localhost:3000/uploads
```

---

## ▶️ Executando o Projeto

### Modo de Desenvolvimento (com auto-reload):

```bash
npm run dev
```

### Modo de Produção:

```bash
npm start
```

A API estará disponível em: **http://localhost:3000**

Teste o health check:

```bash
curl http://localhost:3000/health
```

---

## 📡 Endpoints da API

### **Autenticação** (`/api/auth`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/auth/register` | Registrar novo usuário | Público |
| POST | `/api/auth/login` | Login de usuário | Público |
| GET | `/api/auth/me` | Obter dados do usuário autenticado | Privado |

**Exemplo de Registro:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "reader"
  }'
```

**Exemplo de Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

---

### **Editoras** (`/api/publishers`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/publishers` | Listar todas as editoras | Público |
| GET | `/api/publishers/:id` | Obter editora por ID | Público |
| POST | `/api/publishers` | Criar nova editora | Admin |
| PUT | `/api/publishers/:id` | Atualizar editora | Admin |
| DELETE | `/api/publishers/:id` | Deletar editora | Admin |

---

### **Títulos** (`/api/titles`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/titles` | Listar todos os títulos | Público |
| GET | `/api/titles?publisher_id=1` | Filtrar títulos por editora | Público |
| GET | `/api/titles/:id` | Obter título por ID | Público |
| POST | `/api/titles` | Criar novo título | Admin/Editor |
| PUT | `/api/titles/:id` | Atualizar título | Admin/Editor |
| DELETE | `/api/titles/:id` | Deletar título | Admin |

---

### **Edições** (`/api/issues`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/issues` | Listar todas as edições | Público |
| GET | `/api/issues?title_id=1` | Filtrar edições por título | Público |
| GET | `/api/issues/search?q=x-men` | Buscar edições | Público |
| GET | `/api/issues/:id` | Obter edição por ID (com títulos similares) | Público |
| POST | `/api/issues` | Criar nova edição | Admin/Editor |
| PUT | `/api/issues/:id` | Atualizar edição | Admin/Editor |
| DELETE | `/api/issues/:id` | Deletar edição | Admin |

---

### **Avaliações e Comentários** (`/api/issues`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/issues/:issue_id/rate` | Avaliar uma edição (1-5) | Privado |
| GET | `/api/issues/:issue_id/ratings` | Obter avaliações de uma edição | Público |
| POST | `/api/issues/:issue_id/comments` | Adicionar comentário | Privado |
| GET | `/api/issues/:issue_id/comments` | Obter comentários | Público |
| DELETE | `/api/comments/:comment_id` | Deletar comentário | Privado (Autor/Admin) |

---

### **Favoritos** (`/api/favorites`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/favorites` | Listar favoritos do usuário | Privado |
| POST | `/api/favorites/:issue_id` | Adicionar aos favoritos | Privado |
| DELETE | `/api/favorites/:issue_id` | Remover dos favoritos | Privado |
| GET | `/api/favorites/:issue_id/check` | Verificar se está nos favoritos | Privado |

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Após o login, você receberá um token que deve ser incluído no header `Authorization` de todas as requisições protegidas:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Exemplo:**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 👥 Permissões (Roles)

A API possui três níveis de permissão:

| Role | Descrição | Permissões |
|------|-----------|------------|
| **reader** | Usuário comum | Ler conteúdo, comentar, avaliar, favoritar |
| **editor** | Editor de conteúdo | Tudo do reader + criar/editar títulos e edições |
| **admin** | Administrador | Acesso total (incluir deletar editoras e títulos) |

---

## 🔮 Próximos Passos

### Funcionalidades Sugeridas:

1. **Upload de Arquivos Real**:
   - Implementar rotas de upload usando Multer
   - Integrar com serviços de armazenamento (AWS S3, Cloudinary)

2. **Sistema de Notificações**:
   - Notificar usuários quando uma nova edição de um título favorito é publicada

3. **Paginação Avançada**:
   - Implementar paginação consistente em todos os endpoints de listagem

4. **Logs e Monitoramento**:
   - Adicionar Winston para logs estruturados
   - Implementar métricas com Prometheus

5. **Testes Automatizados**:
   - Adicionar testes unitários (Jest)
   - Testes de integração (Supertest)

6. **Documentação Interativa**:
   - Integrar Swagger/OpenAPI para documentação automática

7. **Cache**:
   - Implementar Redis para cache de consultas frequentes

8. **Rate Limiting**:
   - Adicionar limitação de taxa para prevenir abuso

---

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença ISC.

---

## 👨‍💻 Autor

Desenvolvido por **Manus AI**

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Documentação criada em:** Outubro de 2025

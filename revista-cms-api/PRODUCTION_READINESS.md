# 🚀 PRODUCTION READINESS CHECKLIST
## Análise de Prontidão para Deploy em Produção

**Data:** 07 de Novembro de 2025
**Projeto:** theoldshinobi-site (revista-cms-api)
**Versão:** 1.0.0
**Status Atual:** 🟡 **NÃO PRONTO PARA PRODUÇÃO**

---

## 📊 RESUMO EXECUTIVO

### Status Geral: 40% Pronto

| Categoria | Status | Progresso | Prioridade |
|-----------|--------|-----------|------------|
| **Segurança** | 🟢 Bom | 85% | ✅ Completo |
| **Arquitetura** | 🟢 Bom | 90% | ✅ Completo |
| **Testes** | 🔴 Crítico | 0% | ⚠️ BLOQUEADOR |
| **CI/CD** | 🔴 Crítico | 0% | ⚠️ BLOQUEADOR |
| **Containerização** | 🔴 Crítico | 0% | ⚠️ BLOQUEADOR |
| **Monitoramento** | 🔴 Crítico | 10% | ⚠️ BLOQUEADOR |
| **Documentação API** | 🟡 Médio | 30% | 🔶 Importante |
| **Database Ops** | 🔴 Crítico | 20% | ⚠️ BLOQUEADOR |
| **Backup/DR** | 🔴 Crítico | 0% | ⚠️ BLOQUEADOR |

### ⚠️ BLOQUEADORES CRÍTICOS (5)

Estes itens **DEVEM** ser resolvidos antes de qualquer deploy em produção:

1. **Testes Automatizados** - 0% de cobertura
2. **CI/CD Pipeline** - Inexistente
3. **Docker/Containerização** - Não configurado
4. **Database Migrations** - Scripts manuais apenas
5. **Monitoramento e Alertas** - Inexistente

---

## 🔴 CATEGORIA 1: BLOQUEADORES CRÍTICOS

### 1.1 Testes Automatizados (Severidade: CRÍTICA)

**Status Atual:** 🔴 0% de cobertura

**Problema:**
- Nenhum teste unitário implementado
- Nenhum teste de integração
- Nenhum teste E2E
- Script de teste retorna erro: `"Error: no test specified" && exit 1`

**Impacto:**
- ❌ Impossível garantir qualidade do código
- ❌ Regressões não detectadas
- ❌ Refatorações arriscadas
- ❌ Deploy sem confiança

**O que precisa ser feito:**

#### 1.1.1 Configurar Framework de Testes
```bash
npm install --save-dev jest supertest @types/jest
npm install --save-dev @faker-js/faker
```

#### 1.1.2 Estrutura de Testes Necessária
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── AuthService.test.js
│   │   │   └── IssueService.test.js
│   │   ├── repositories/
│   │   │   ├── UserRepository.test.js
│   │   │   └── IssueRepository.test.js
│   │   └── utils/
│   │       ├── pagination.test.js
│   │       └── logger.test.js
│   ├── integration/
│   │   ├── auth.integration.test.js
│   │   ├── issues.integration.test.js
│   │   └── publishers.integration.test.js
│   └── e2e/
│       ├── auth-flow.e2e.test.js
│       └── issue-crud.e2e.test.js
├── __mocks__/
│   ├── database.js
│   └── logger.js
└── test-setup.js
```

#### 1.1.3 Configuração Jest (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.js']
};
```

#### 1.1.4 Atualizar package.json
```json
{
  "scripts": {
    "test": "jest --verbose",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration --runInBand",
    "test:e2e": "jest --testPathPattern=e2e --runInBand"
  }
}
```

#### 1.1.5 Meta de Cobertura Mínima
- **Unitários:** 90% dos Services e Repositories
- **Integração:** 80% dos endpoints da API
- **E2E:** Fluxos críticos (auth, CRUD principal)

**Esforço Estimado:** 40-60 horas
**Prioridade:** 🔴 CRÍTICA (Bloqueador #1)

---

### 1.2 CI/CD Pipeline (Severidade: CRÍTICA)

**Status Atual:** 🔴 Inexistente

**Problema:**
- Nenhum arquivo de CI/CD configurado
- Deploy manual propenso a erros
- Sem testes automatizados no pipeline
- Sem validação de qualidade antes do merge

**Impacto:**
- ❌ Deploy manual inconsistente
- ❌ Risco de deploy de código quebrado
- ❌ Sem rollback automático
- ❌ Tempo de deploy longo e propenso a erros

**O que precisa ser feito:**

#### 1.2.1 GitHub Actions Workflow

Criar `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'
  POSTGRES_VERSION: '15'

jobs:
  # ====================
  # JOB 1: Lint e Format
  # ====================
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

  # ====================
  # JOB 2: Security Scan
  # ====================
  security:
    name: Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # ====================
  # JOB 3: Unit Tests
  # ====================
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: [lint]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests

  # ====================
  # JOB 4: Integration Tests
  # ====================
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [lint]

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: revista_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: revista_test
          DB_USER: test_user
          DB_PASSWORD: test_password
        run: npm run db:init

      - name: Run integration tests
        env:
          NODE_ENV: test
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: revista_test
          DB_USER: test_user
          DB_PASSWORD: test_password
          JWT_SECRET: test_secret_min_32_chars_required_here
        run: npm run test:integration

  # ====================
  # JOB 5: Build Docker Image
  # ====================
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration, security]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/revista-cms-api:latest
            ${{ secrets.DOCKER_USERNAME }}/revista-cms-api:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/revista-cms-api:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/revista-cms-api:buildcache,mode=max

  # ====================
  # JOB 6: Deploy to Production
  # ====================
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.theoldshinobi.com

    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USERNAME }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/revista-cms-api
            docker-compose pull
            docker-compose up -d --no-deps --build api
            docker-compose exec -T api npm run db:migrate
```

#### 1.2.2 Secrets Necessários no GitHub

Configure em: **Settings → Secrets and variables → Actions**

```
DOCKER_USERNAME
DOCKER_PASSWORD
SNYK_TOKEN
CODECOV_TOKEN
PROD_HOST
PROD_USERNAME
PROD_SSH_KEY
```

#### 1.2.3 Branch Protection Rules

Configure em: **Settings → Branches → Branch protection rules**

Para branch `main`:
- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1)
- ✅ Require status checks to pass before merging:
  - lint
  - security
  - test-unit
  - test-integration
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

**Esforço Estimado:** 16-24 horas
**Prioridade:** 🔴 CRÍTICA (Bloqueador #2)

---

### 1.3 Docker e Containerização (Severidade: CRÍTICA)

**Status Atual:** 🔴 Não configurado

**Problema:**
- Nenhum Dockerfile
- Nenhum docker-compose.yml
- Deploy inconsistente entre ambientes
- Difícil replicar ambiente de produção

**Impacto:**
- ❌ "Funciona na minha máquina" syndrome
- ❌ Setup complexo para novos devs
- ❌ Ambientes inconsistentes
- ❌ Deploy lento e manual

**O que precisa ser feito:**

#### 1.3.1 Dockerfile Multi-Stage

Criar `Dockerfile`:
```dockerfile
# ====================
# Stage 1: Build
# ====================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Run linting and validation
RUN npm run lint && npm run format:check

# ====================
# Stage 2: Production
# ====================
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/database ./database
COPY --from=builder --chown=nodejs:nodejs /app/scripts ./scripts

# Create uploads directory
RUN mkdir -p uploads/covers uploads/pdfs && \
    chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
```

#### 1.3.2 .dockerignore

Criar `.dockerignore`:
```
node_modules
npm-debug.log
.env
.env.*
!.env.example
.git
.gitignore
README.md
*.md
.vscode
.idea
coverage
.nyc_output
.DS_Store
uploads/*
!uploads/.gitkeep
```

#### 1.3.3 docker-compose.yml para Desenvolvimento

Criar `docker-compose.yml`:
```yaml
version: '3.9'

services:
  # ====================
  # PostgreSQL Database
  # ====================
  db:
    image: postgres:15-alpine
    container_name: revista-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - revista-network

  # ====================
  # API Application
  # ====================
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: revista-api
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: ${PORT:-3000}
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      BCRYPT_SALT_ROUNDS: ${BCRYPT_SALT_ROUNDS:-12}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - revista-network

  # ====================
  # Redis Cache (Opcional)
  # ====================
  redis:
    image: redis:7-alpine
    container_name: revista-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - revista-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  revista-network:
    driver: bridge
```

#### 1.3.4 docker-compose.prod.yml

Criar `docker-compose.prod.yml`:
```yaml
version: '3.9'

services:
  api:
    image: ${DOCKER_REGISTRY}/revista-cms-api:${VERSION:-latest}
    restart: always
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
```

#### 1.3.5 Scripts de Deploy

Criar `scripts/deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Stop old containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec -T api npm run db:migrate

# Health check
sleep 10
if curl -f http://localhost:3000/health; then
  echo "✅ Deployment successful!"
else
  echo "❌ Health check failed!"
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs api
  exit 1
fi
```

**Esforço Estimado:** 12-16 horas
**Prioridade:** 🔴 CRÍTICA (Bloqueador #3)

---

### 1.4 Database Migrations (Severidade: CRÍTICA)

**Status Atual:** 🔴 Scripts SQL manuais apenas

**Problema:**
- Apenas `init.sql` para setup inicial
- Sem versionamento de schema
- Sem rollback de alterações
- Difícil sincronizar entre ambientes

**Impacto:**
- ❌ Alterações de schema arriscadas
- ❌ Sem histórico de mudanças
- ❌ Impossível fazer rollback
- ❌ Sincronização manual entre dev/staging/prod

**O que precisa ser feito:**

#### 1.4.1 Instalar node-pg-migrate

```bash
npm install --save node-pg-migrate
npm install --save-dev @types/node-pg-migrate
```

#### 1.4.2 Configurar Migrations

Criar `.migrations.json`:
```json
{
  "databaseUrl": {
    "env": "DATABASE_URL"
  },
  "migrationsTable": "pgmigrations",
  "dir": "database/migrations",
  "checkOrder": true,
  "direction": "up",
  "log": true,
  "verbose": true
}
```

#### 1.4.3 Estrutura de Migrations

```
database/
├── migrations/
│   ├── 1699000000000_initial-schema.js
│   ├── 1699000000001_add-users-table.js
│   ├── 1699000000002_add-publishers-table.js
│   ├── 1699000000003_add-titles-table.js
│   ├── 1699000000004_add-issues-table.js
│   └── 1699000000005_add-ratings-favorites.js
└── init.sql (deprecated - será substituído)
```

#### 1.4.4 Exemplo de Migration

Criar `database/migrations/1699000000001_add-users-table.js`:
```javascript
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create users table
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    password_hash: {
      type: 'text',
      notNull: true
    },
    role: {
      type: 'varchar(50)',
      notNull: true,
      default: 'reader',
      check: "role IN ('admin', 'editor', 'reader')"
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'role');

  // Create updated_at trigger
  pgm.createFunction(
    'trigger_set_timestamp',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      replace: true
    },
    `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger('users', 'set_timestamp', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'trigger_set_timestamp',
    level: 'ROW'
  });
};

exports.down = pgm => {
  pgm.dropTable('users', { cascade: true });
  pgm.dropFunction('trigger_set_timestamp', [], { cascade: true });
};
```

#### 1.4.5 Atualizar package.json

```json
{
  "scripts": {
    "db:migrate": "node-pg-migrate up",
    "db:migrate:down": "node-pg-migrate down",
    "db:migrate:create": "node-pg-migrate create",
    "db:migrate:redo": "node-pg-migrate redo",
    "db:migrate:status": "node-pg-migrate status"
  }
}
```

#### 1.4.6 Variável de Ambiente

Adicionar ao `.env`:
```
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

#### 1.4.7 Migration Strategy

1. **Desenvolvimento:**
   - Create migration: `npm run db:migrate:create add-new-column`
   - Apply migration: `npm run db:migrate`
   - Test changes
   - Rollback if needed: `npm run db:migrate:down`

2. **Staging:**
   - Pull latest code with migrations
   - Run: `npm run db:migrate`
   - Test

3. **Produção:**
   - Backup database first
   - Run: `npm run db:migrate`
   - Monitor application
   - Rollback plan: `npm run db:migrate:down`

**Esforço Estimado:** 24-32 horas
**Prioridade:** 🔴 CRÍTICA (Bloqueador #4)

---

### 1.5 Monitoramento e Observabilidade (Severidade: CRÍTICA)

**Status Atual:** 🔴 Logs básicos apenas

**Problema:**
- Apenas `console.log()` básico
- Sem agregação de logs
- Sem métricas de performance
- Sem alertas de incidentes
- Sem tracing distribuído

**Impacto:**
- ❌ Difícil debuggar problemas em produção
- ❌ Sem visibilidade de performance
- ❌ Incidentes descobertos por usuários
- ❌ MTTR (Mean Time To Recovery) alto

**O que precisa ser feito:**

#### 1.5.1 Structured Logging com Winston

```bash
npm install winston winston-daily-rotate-file
```

Atualizar `src/utils/logger.js`:
```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Transport: Console
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  )
});

// Transport: Rotating File
const fileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Transport: Error File
const errorFileTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'revista-cms-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    consoleTransport,
    fileTransport,
    errorFileTransport
  ]
});

// Add request ID to all logs
logger.addRequestContext = (req, res, next) => {
  req.id = require('crypto').randomUUID();
  req.logger = logger.child({ requestId: req.id });
  next();
};

module.exports = logger;
```

#### 1.5.2 Application Performance Monitoring (APM)

Opção 1: **Elastic APM** (Open Source)
```bash
npm install elastic-apm-node
```

Criar `src/apm.js`:
```javascript
const apm = require('elastic-apm-node').start({
  serviceName: 'revista-cms-api',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  environment: process.env.NODE_ENV,
  captureBody: 'errors',
  captureHeaders: true,
  logLevel: 'info'
});

module.exports = apm;
```

Opção 2: **New Relic**
```bash
npm install newrelic
```

Opção 3: **Datadog**
```bash
npm install dd-trace --save
```

#### 1.5.3 Prometheus Metrics

```bash
npm install prom-client
```

Criar `src/middleware/metrics.js`:
```javascript
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const databaseQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const activeConnections = new promClient.Gauge({
  name: 'db_active_connections',
  help: 'Number of active database connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(databaseQueryDuration);
register.registerMetric(activeConnections);

// Middleware to track requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  databaseQueryDuration,
  activeConnections
};
```

Adicionar endpoint de métricas no `src/index.js`:
```javascript
const { register, metricsMiddleware } = require('./middleware/metrics');

app.use(metricsMiddleware);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### 1.5.4 Health Check Avançado

Atualizar `/health` endpoint:
```javascript
const pool = require('./config/database');

app.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {}
  };

  try {
    // Database check
    const dbStart = Date.now();
    const result = await pool.query('SELECT NOW()');
    const dbDuration = Date.now() - dbStart;

    healthcheck.checks.database = {
      status: 'up',
      responseTime: dbDuration,
      timestamp: result.rows[0].now
    };

    // Memory check
    const memUsage = process.memoryUsage();
    healthcheck.checks.memory = {
      status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'up' : 'warning',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      usage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`
    };

    // Connection pool check
    healthcheck.checks.connectionPool = {
      status: 'up',
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'ERROR';
    healthcheck.checks.database = {
      status: 'down',
      error: error.message
    };
    res.status(503).json(healthcheck);
  }
});

// Readiness probe
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Liveness probe
app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
```

#### 1.5.5 Alerting com Grafana

Criar `monitoring/grafana-dashboard.json` e `monitoring/alerts.yml`:

```yaml
groups:
  - name: revista-cms-api
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "P95 latency is {{ $value }}s"

      # Database connection issues
      - alert: DatabaseConnectionPoolExhausted
        expr: db_active_connections > 18
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Active connections: {{ $value }}/20"

      # High memory usage
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 500000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage: {{ $value | humanize }}B"
```

#### 1.5.6 Stack de Monitoramento Recomendada

**Opção 1: ELK Stack (Open Source)**
- **Elasticsearch**: Armazenamento de logs
- **Logstash**: Processamento de logs
- **Kibana**: Visualização

**Opção 2: PLG Stack (Open Source)**
- **Promtail**: Coleta de logs
- **Loki**: Armazenamento de logs
- **Grafana**: Visualização + Prometheus para métricas

**Opção 3: Cloud Services**
- **Datadog**: All-in-one (pago)
- **New Relic**: APM + Logs (pago)
- **Elastic Cloud**: ELK managed (pago)

**Esforço Estimado:** 40-60 horas
**Prioridade:** 🔴 CRÍTICA (Bloqueador #5)

---

## 🟡 CATEGORIA 2: IMPORTANTES (Não Bloqueadores)

### 2.1 Documentação de API (Swagger/OpenAPI)

**Status Atual:** 🟡 Apenas Postman collection

**Esforço:** 16-20 horas
**Prioridade:** 🔶 ALTA

#### O que fazer:

```bash
npm install swagger-ui-express swagger-jsdoc
```

Criar `src/config/swagger.js`:
```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Revista CMS API',
      version: '1.0.0',
      description: 'API RESTful para gerenciamento de revistas e quadrinhos',
      contact: {
        name: 'API Support',
        email: 'support@theoldshinobi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.theoldshinobi.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
```

Adicionar ao `src/index.js`:
```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
```

---

### 2.2 Backup e Disaster Recovery

**Status Atual:** 🔴 Inexistente

**Esforço:** 24-32 horas
**Prioridade:** 🔶 ALTA

#### Estratégia de Backup:

1. **Database Backups Automatizados**

Criar `scripts/backup-db.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/revista_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file=$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://revista-backups/database/

# Keep only last 7 days locally
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_FILE"
```

Agendar com cron:
```cron
# Backup diário às 2 AM
0 2 * * * /opt/revista-cms-api/scripts/backup-db.sh

# Backup de uploads semanalmente
0 3 * * 0 rsync -avz /opt/revista-cms-api/uploads/ s3://revista-backups/uploads/
```

2. **Disaster Recovery Plan**

Criar `docs/disaster-recovery.md`:
```markdown
# Disaster Recovery Plan

## RTO (Recovery Time Objective): 4 hours
## RPO (Recovery Point Objective): 24 hours

### Scenario 1: Database Corruption
1. Stop application
2. Restore from latest backup
3. Run migrations
4. Restart application
5. Validate data integrity

### Scenario 2: Complete Server Failure
1. Provision new server
2. Deploy application via Docker
3. Restore database backup
4. Restore uploads from S3
5. Update DNS
6. Validate functionality
```

---

### 2.3 Secrets Management

**Status Atual:** 🟡 .env files

**Esforço:** 12-16 horas
**Prioridade:** 🔶 ALTA

#### Opções:

**Opção 1: HashiCorp Vault**
```bash
npm install node-vault
```

**Opção 2: AWS Secrets Manager**
```bash
npm install @aws-sdk/client-secrets-manager
```

**Opção 3: Doppler (mais simples)**
```bash
npm install --save-dev @doppler/cli
doppler setup
doppler run -- npm start
```

---

### 2.4 Rate Limiting Avançado

**Status Atual:** 🟢 Básico implementado

**Melhorias necessárias:**
- Rate limiting baseado em usuário
- Rate limiting distribuído (Redis)
- Diferentes limites por plano/subscription

---

### 2.5 Caching Strategy

**Status Atual:** 🔴 Sem cache

**Esforço:** 20-24 horas
**Prioridade:** 🔶 MÉDIA

#### Implementar Redis Cache:

```bash
npm install redis ioredis
```

Criar `src/utils/cache.js`:
```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

class Cache {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key) {
    await redis.del(key);
  }

  async flush() {
    await redis.flushdb();
  }
}

module.exports = new Cache();
```

Middleware de cache:
```javascript
const cache = require('../utils/cache');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedResponse = await cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
```

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 BLOQUEADORES CRÍTICOS (FASE 1)
Estimativa total: **132-192 horas** (3-5 semanas)

1. ✅ Testes Automatizados (40-60h)
2. ✅ CI/CD Pipeline (16-24h)
3. ✅ Docker/Containerização (12-16h)
4. ✅ Database Migrations (24-32h)
5. ✅ Monitoramento (40-60h)

### 🔶 IMPORTANTES (FASE 2)
Estimativa total: **88-116 horas** (2-3 semanas)

6. Swagger/OpenAPI Documentation (16-20h)
7. Backup & Disaster Recovery (24-32h)
8. Secrets Management (12-16h)
9. Caching com Redis (20-24h)
10. Security Scanning (16-24h)

### 🟢 MELHORIAS (FASE 3)
Estimativa total: **40-60 horas** (1-2 semanas)

11. Feature Flags
12. API Versioning
13. WebSockets para real-time
14. GraphQL endpoint (opcional)
15. Admin Dashboard

---

## 🎯 ROADMAP RECOMENDADO

### Sprint 1 (Semana 1-2): Testing Foundation
- [ ] Configurar Jest e Supertest
- [ ] Escrever testes unitários para Services
- [ ] Escrever testes unitários para Repositories
- [ ] Atingir 80% de cobertura

### Sprint 2 (Semana 3-4): Testing & CI/CD
- [ ] Escrever testes de integração
- [ ] Configurar GitHub Actions
- [ ] Configurar proteção de branches
- [ ] Adicionar badges de status

### Sprint 3 (Semana 5): Containerização
- [ ] Criar Dockerfile
- [ ] Criar docker-compose
- [ ] Testar builds localmente
- [ ] Documentar processo

### Sprint 4 (Semana 6-7): Database Migrations
- [ ] Configurar node-pg-migrate
- [ ] Criar migrations do schema atual
- [ ] Testar rollbacks
- [ ] Documentar processo

### Sprint 5 (Semana 8-9): Monitoramento
- [ ] Configurar Winston logging
- [ ] Adicionar Prometheus metrics
- [ ] Configurar health checks avançados
- [ ] Setup Grafana dashboards
- [ ] Configurar alertas

### Sprint 6 (Semana 10): Documentação & Backups
- [ ] Adicionar Swagger docs
- [ ] Configurar backups automatizados
- [ ] Criar runbooks
- [ ] Disaster recovery testing

### Sprint 7 (Semana 11): Final Polish
- [ ] Secrets management
- [ ] Caching strategy
- [ ] Performance testing
- [ ] Security audit final

---

## ✅ CHECKLIST FINAL ANTES DE PRODUÇÃO

### Segurança
- [ ] Todas as vulnerabilidades críticas resolvidas
- [ ] Secrets não estão no código
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Security headers (Helmet) ativo
- [ ] Input validation em todos endpoints
- [ ] SQL injection prevenida
- [ ] Audit de dependências passing

### Testing
- [ ] Cobertura de testes > 80%
- [ ] Todos os testes passando
- [ ] Testes de integração implementados
- [ ] Testes E2E para fluxos críticos
- [ ] Performance testing realizado

### Infrastructure
- [ ] Docker images building
- [ ] docker-compose funcionando
- [ ] CI/CD pipeline verde
- [ ] Database migrations funcionando
- [ ] Backups automatizados configurados
- [ ] Disaster recovery testado

### Monitoramento
- [ ] Logs estruturados implementados
- [ ] Métricas coletadas (Prometheus)
- [ ] Health checks funcionando
- [ ] Dashboards criados (Grafana)
- [ ] Alertas configurados
- [ ] Runbooks escritos

### Documentação
- [ ] README.md atualizado
- [ ] API documentada (Swagger)
- [ ] Guia de deploy escrito
- [ ] Runbooks de operação
- [ ] Disaster recovery plan
- [ ] Arquitetura documentada

### Compliance
- [ ] LGPD/GDPR considerations
- [ ] Logs não contêm dados sensíveis
- [ ] Política de retenção de dados
- [ ] Terms of Service
- [ ] Privacy Policy

---

## 🚦 DECISÃO FINAL

### ❌ SISTEMA NÃO ESTÁ PRONTO PARA PRODUÇÃO

**Razão:** 5 bloqueadores críticos impedem deploy seguro

**Estimativa para produção:** **11-16 semanas** de trabalho

**Recomendação:**
1. **Imediato (Fase 1):** Resolver bloqueadores críticos (5 semanas)
2. **Curto prazo (Fase 2):** Implementar itens importantes (3 semanas)
3. **Médio prazo (Fase 3):** Melhorias e otimizações (2 semanas)

**MVP Mínimo para Produção (Fase 1 apenas):**
- ✅ Testes com 80% cobertura
- ✅ CI/CD funcional
- ✅ Docker + docker-compose
- ✅ Database migrations
- ✅ Monitoramento básico

Após Fase 1 completa, o sistema pode ser deployed em produção com **monitoramento muito próximo** e **disponibilidade limitada** (soft launch/beta).

---

## 📞 PRÓXIMOS PASSOS

1. **Revisar este documento** com stakeholders
2. **Priorizar itens** baseado em business needs
3. **Alocar recursos** (tempo/pessoas)
4. **Criar sprint planning** detalhado
5. **Começar pela Fase 1** imediatamente

**Última atualização:** 07/11/2025
**Revisão necessária:** Após cada sprint

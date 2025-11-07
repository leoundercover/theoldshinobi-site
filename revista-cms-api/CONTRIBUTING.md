# Guia de Contribuição

Obrigado por considerar contribuir para o **revista-cms-api**! Este documento fornece diretrizes e melhores práticas para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)

---

## Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

---

## Como Posso Contribuir?

### Reportando Bugs

Antes de criar um issue de bug, verifique se já não existe um issue similar. Ao criar um novo issue, inclua:

- **Descrição clara**: O que aconteceu vs. o que era esperado
- **Passos para reproduzir**: Instruções detalhadas
- **Ambiente**: Versão do Node.js, SO, etc.
- **Logs**: Mensagens de erro relevantes

### Sugerindo Melhorias

Issues de melhoria são bem-vindos! Inclua:

- **Motivação**: Por que essa melhoria é necessária?
- **Descrição**: O que deve ser implementado?
- **Alternativas**: Outras abordagens consideradas

### Pull Requests

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas alterações
4. Execute os testes: `npm test`
5. Commit suas mudanças
6. Push para a branch: `git push origin feature/minha-feature`
7. Abra um Pull Request

---

## Padrões de Código

### JavaScript Style Guide

Este projeto segue o **ESLint** e **Prettier** para padronização de código.

#### Regras Principais

```javascript
// ✅ BOM
const userName = 'John Doe';
const getUserById = async (id) => {
  const user = await UserRepository.findById(id);
  return user;
};

// ❌ RUIM
var userName = "John Doe"  // sem ponto e vírgula
const getUserById = async id => {  // sem parênteses
  const user = await UserRepository.findById(id)
  return user
}
```

#### Executar Lint

```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Verificar formatação
npm run format:check

# Formatar código
npm run format
```

### Convenções de Nomenclatura

#### Variáveis e Funções

```javascript
// camelCase para variáveis e funções
const userName = 'John';
const getUserById = () => {};

// PascalCase para classes
class UserService {}
class UserDTO {}

// UPPER_SNAKE_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://api.example.com';
```

#### Arquivos

```
// camelCase para utilities e helpers
utils/pagination.js
utils/logger.js

// PascalCase para classes
services/AuthService.js
repositories/UserRepository.js
dtos/UserDTO.js

// kebab-case para configs
.eslintrc.json
.prettierrc.json
```

### Estrutura de Arquivos

#### Repository

```javascript
/**
 * Repository para [Entidade]
 * Responsável por acesso a dados
 */
const pool = require('../config/database');

class ExampleRepository {
  /**
   * Buscar por ID
   * @param {number} id - ID do registro
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await pool.query('SELECT * FROM examples WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Mais métodos...
}

module.exports = new ExampleRepository();
```

#### Service

```javascript
/**
 * Service de [Entidade]
 * Responsável por lógica de negócio
 */
const ExampleRepository = require('../repositories/ExampleRepository');
const { ERROR_CODES, HTTP_STATUS } = require('../constants');

class ExampleService {
  /**
   * Buscar exemplo por ID
   * @param {number} id - ID do exemplo
   * @returns {Promise<Object>}
   * @throws {Error} Se não encontrado
   */
  async getById(id) {
    const example = await ExampleRepository.findById(id);

    if (!example) {
      const error = new Error('Exemplo não encontrado');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return example;
  }

  // Mais métodos...
}

module.exports = new ExampleService();
```

#### Controller

```javascript
/**
 * Controller de [Entidade]
 * Responsável por coordenar requisições HTTP
 */
const ExampleService = require('../services/ExampleService');
const ResponseDTO = require('../dtos/ResponseDTO');

/**
 * Buscar exemplo por ID
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await ExampleService.getById(id);
    const response = ResponseDTO.success(example);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getById };
```

### Tratamento de Erros

#### Criando Erros Customizados

```javascript
const { ERROR_CODES, HTTP_STATUS } = require('../constants');

// ✅ BOM: Erro com statusCode e code
const error = new Error('Email já cadastrado');
error.statusCode = HTTP_STATUS.CONFLICT;
error.code = ERROR_CODES.EMAIL_EXISTS;
throw error;

// ❌ RUIM: Erro sem metadados
throw new Error('Erro!');
```

#### Tratamento em Services

```javascript
// Services devem lançar erros específicos
async createUser(userData) {
  const exists = await UserRepository.emailExists(userData.email);

  if (exists) {
    const error = new Error('Email já cadastrado');
    error.statusCode = 409;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // Continuar...
}
```

#### Tratamento em Controllers

```javascript
// Controllers apenas chamam services e tratam erros genericamente
const createUser = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);
    const response = ResponseDTO.created(user);
    res.status(201).json(response);
  } catch (error) {
    next(error); // Passa para errorHandler middleware
  }
};
```

### Uso de Constantes

```javascript
// ❌ RUIM: Valores mágicos
if (user.role === 'admin') {}
if (statusCode === 404) {}

// ✅ BOM: Usar constantes
const { USER_ROLES, HTTP_STATUS } = require('../constants');

if (user.role === USER_ROLES.ADMIN) {}
if (statusCode === HTTP_STATUS.NOT_FOUND) {}
```

### Async/Await

```javascript
// ✅ BOM: Async/await consistente
const getUser = async (id) => {
  const user = await UserRepository.findById(id);
  return user;
};

// ❌ RUIM: Misturar promises e async/await
const getUser = (id) => {
  return UserRepository.findById(id).then(user => {
    return user;
  });
};
```

### Comentários e Documentação

```javascript
/**
 * JSDoc para funções públicas
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Token e dados do usuário
 * @throws {Error} Se credenciais inválidas
 */
async login(email, password) {
  // Comentários inline apenas quando necessário
  // Código auto-explicativo é preferível
  const user = await this.validateCredentials(email, password);
  const token = this.generateToken(user);
  return { user, token };
}
```

---

## Estrutura do Projeto

```
src/
├── controllers/     # Coordenação HTTP
├── services/        # Lógica de negócio
├── repositories/    # Acesso a dados
├── dtos/            # Transformação de dados
├── middleware/      # Middlewares Express
├── routes/          # Definição de rotas
├── utils/           # Utilitários
├── constants/       # Constantes e enums
└── config/          # Configurações
```

### Camadas e Responsabilidades

1. **Controllers**: Recebem req/res, chamam services, retornam respostas
2. **Services**: Contêm lógica de negócio, orquestram repositories
3. **Repositories**: Executam queries SQL, retornam dados brutos
4. **DTOs**: Transformam dados entre camadas
5. **Middleware**: Interceptam requisições (auth, validation, etc)

---

## Workflow de Desenvolvimento

### Setup Inicial

```bash
# Clone o repositório
git clone [URL]

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Inicialize o banco de dados
npm run db:init

# Crie um admin
npm run create-admin

# Execute em modo desenvolvimento
npm run dev
```

### Desenvolvimento

```bash
# Executar em modo desenvolvimento (auto-reload)
npm run dev

# Executar com debugger
npm run dev:debug

# Executar lint
npm run lint

# Formatar código
npm run format

# Validar código (lint + format check)
npm run validate
```

### Pre-commit Hooks

O projeto usa **Husky** e **lint-staged** para executar automaticamente:

- ESLint (corrige problemas)
- Prettier (formata código)

Antes de cada commit, o código será automaticamente validado e formatado.

---

## Commits

### Convenção de Commits

Seguimos a convenção **Conventional Commits**:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Apenas documentação
- **style**: Formatação (não afeta lógica)
- **refactor**: Refatoração de código
- **perf**: Melhoria de performance
- **test**: Adicionar/modificar testes
- **chore**: Tarefas de manutenção
- **ci**: Mudanças em CI/CD
- **build**: Mudanças em build system

#### Exemplos

```bash
# Feature
feat(auth): adicionar endpoint de refresh token

# Bugfix
fix(users): corrigir validação de email

# Refactor
refactor(services): extrair lógica de autenticação para AuthService

# Documentation
docs(readme): atualizar instruções de instalação

# Performance
perf(queries): otimizar query de busca de issues

# Style
style(controllers): formatar código com prettier
```

---

## Pull Requests

### Checklist

Antes de abrir um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Lint passa (`npm run lint`)
- [ ] Código está formatado (`npm run format`)
- [ ] Testes passam (`npm test`)
- [ ] Documentação foi atualizada
- [ ] Commit messages seguem convenção
- [ ] Branch está atualizada com `main`

### Descrição do PR

Use o template:

```markdown
## Descrição

[Descrição clara do que foi implementado/corrigido]

## Motivação

[Por que essa mudança foi necessária?]

## Mudanças

- [Mudança 1]
- [Mudança 2]
- [Mudança 3]

## Testes

[Como foi testado?]

## Screenshots (se aplicável)

[Screenshots ou GIFs demonstrando a mudança]

## Issues Relacionados

Closes #123
```

---

## Testes

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
__tests__/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/
│   └── controllers/
└── e2e/
    └── flows/
```

### Exemplo de Teste

```javascript
const UserService = require('../src/services/UserService');
const UserRepository = require('../src/repositories/UserRepository');

// Mock do repository
jest.mock('../src/repositories/UserRepository');

describe('UserService', () => {
  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(false);
      UserRepository.create.mockResolvedValue({ id: 1, name: 'John' });

      // Act
      const user = await UserService.register({
        name: 'John',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(UserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se email já existe', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(
        UserService.register({
          name: 'John',
          email: 'existing@example.com',
          password: 'Pass123!'
        })
      ).rejects.toThrow('Email já cadastrado');
    });
  });
});
```

---

## Dúvidas?

Se tiver dúvidas sobre como contribuir, sinta-se à vontade para:

- Abrir um issue com suas perguntas
- Contatar os maintainers
- Consultar a documentação no README.md

**Obrigado por contribuir! 🎉**

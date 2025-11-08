#!/bin/bash

# ============================================
# THE OLD SHINOBI - Instalação do Backend
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo "🔧 Instalando Backend (API REST)"
echo "============================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "revista-cms-api/package.json" ]; then
    echo -e "${RED}✗ Erro: Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

cd revista-cms-api

echo -e "${BLUE}📦 Instalando dependências do backend...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}🔐 Configurando variáveis de ambiente...${NC}"

# Verificar se já existe configuração
EXISTING_ENV=false
if [ -f .env ]; then
    EXISTING_ENV=true
    source .env 2>/dev/null || true
    
    echo -e "${YELLOW}⚠ Arquivo .env já existe${NC}"
    echo ""
    echo -e "${BLUE}Configuração atual:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo ""
    echo "Opções:"
    echo "1) Manter configuração atual"
    echo "2) Atualizar apenas o Connection String"
    echo "3) Reconfigurar tudo"
    read -p "Escolha (1-3): " ENV_OPTION
    
    case $ENV_OPTION in
        1)
            echo -e "${GREEN}✓ Mantendo configuração existente${NC}"
            echo ""
            echo -e "${GREEN}✓ Backend configurado!${NC}"
            exit 0
            ;;
        2)
            echo ""
            echo -e "${BLUE}📋 Configure seu banco Supabase:${NC}"
            echo "1. Acesse https://app.supabase.com"
            echo "2. Vá em Settings → Database"
            echo "3. Copie a Connection String (modo Transaction)"
            echo ""
            echo -e "${YELLOW}Formato esperado:${NC}"
            echo "postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres"
            echo ""
            
            # Loop até conseguir uma URL válida
            while true; do
                read -p "Cole a Connection String: " SUPABASE_URL
                
                # Validar e extrair informações da URL
                if [[ $SUPABASE_URL =~ ^postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
                    DB_USER="${BASH_REMATCH[1]}"
                    DB_PASSWORD="${BASH_REMATCH[2]}"
                    DB_HOST="${BASH_REMATCH[3]}"
                    DB_PORT="${BASH_REMATCH[4]}"
                    DB_NAME="${BASH_REMATCH[5]}"
                    DB_SSL="true"
                    
                    # Manter JWT_SECRET existente
                    JWT_SECRET=$JWT_SECRET
                    
                    echo -e "${GREEN}✓ Configuração Supabase extraída com sucesso${NC}"
                    break
                else
                    echo -e "${RED}✗ URL inválida.${NC}"
                    echo -e "${YELLOW}A Connection String deve começar com 'postgresql://'${NC}"
                    echo -e "${YELLOW}Exemplo: postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres${NC}"
                    echo ""
                fi
            done
            ;;
        3)
            # Continuar para reconfiguração completa
            ;;
        *)
            echo -e "${RED}✗ Opção inválida${NC}"
            exit 1
            ;;
    esac
fi

# Se não existe .env ou escolheu reconfigurar tudo
if [ "$EXISTING_ENV" = false ] || [ "$ENV_OPTION" = "3" ]; then
    # Gerar JWT_SECRET forte
    echo -e "${BLUE}→ Gerando JWT_SECRET...${NC}"
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Perguntar informações do banco
    echo ""
    echo -e "${BLUE}Configuração do Banco de Dados:${NC}"
    echo "-----------------------------------"
    echo "Você está usando Supabase ou PostgreSQL local?"
    echo "1) Supabase (recomendado)"
    echo "2) PostgreSQL local"
    read -p "Escolha (1 ou 2): " DB_CHOICE
    
    if [ "$DB_CHOICE" = "1" ]; then
        echo ""
        echo -e "${BLUE}📋 Configure seu banco Supabase:${NC}"
        echo "1. Acesse https://app.supabase.com"
        echo "2. Vá em Settings → Database"
        echo "3. Copie a Connection String (modo Transaction)"
        echo ""
        echo -e "${YELLOW}Formato esperado:${NC}"
        echo "postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres"
        echo ""
        
        # Loop até conseguir uma URL válida
        while true; do
            read -p "Cole a Connection String: " SUPABASE_URL
            
            # Extrair informações da URL
            if [[ $SUPABASE_URL =~ ^postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
                DB_USER="${BASH_REMATCH[1]}"
                DB_PASSWORD="${BASH_REMATCH[2]}"
                DB_HOST="${BASH_REMATCH[3]}"
                DB_PORT="${BASH_REMATCH[4]}"
                DB_NAME="${BASH_REMATCH[5]}"
                DB_SSL="true"
                
                echo -e "${GREEN}✓ Configuração Supabase extraída com sucesso${NC}"
                break
            else
                echo -e "${RED}✗ URL inválida.${NC}"
                echo -e "${YELLOW}A Connection String deve começar com 'postgresql://'${NC}"
                echo -e "${YELLOW}Exemplo: postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres${NC}"
                echo ""
            fi
        done
    else
        echo ""
        read -p "Host do banco (localhost): " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        
        read -p "Porta (5432): " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        
        read -p "Nome do banco (revista_cms): " DB_NAME
        DB_NAME=${DB_NAME:-revista_cms}
        
        read -p "Usuário (postgres): " DB_USER
        DB_USER=${DB_USER:-postgres}
        
        read -sp "Senha: " DB_PASSWORD
        echo ""
        
        DB_SSL="false"
    fi
fi

# Criar arquivo .env
cat > .env << EOF
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados PostgreSQL
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=$DB_SSL

# Configuração de Autenticação JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Configuração de Upload de Arquivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# URL base para arquivos estáticos
FILES_BASE_URL=http://localhost:3000/uploads

# Configuração de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Configuração de Salt Rounds para bcrypt
BCRYPT_SALT_ROUNDS=12
EOF

echo ""
echo -e "${GREEN}✓ Arquivo .env criado com sucesso!${NC}"
echo ""

# Testar conexão com banco
echo -e "${BLUE}🔍 Testando conexão com o banco de dados...${NC}"
node -e "
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✓ Conexão estabelecida com sucesso!');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Erro ao conectar:', err.message);
    pool.end();
    process.exit(1);
  });
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Banco de dados conectado!${NC}"
else
    echo -e "${YELLOW}⚠ Não foi possível conectar ao banco${NC}"
    echo -e "${YELLOW}→ Verifique as credenciais no arquivo .env${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✓ Backend instalado com sucesso!${NC}"
echo "============================================"
echo ""
echo "Próximos passos:"
echo "1. Execute o SQL no Supabase (arquivo supabase-schema.sql)"
echo "2. Inicie o servidor: cd revista-cms-api && npm run dev"
echo "3. Acesse: http://localhost:3000/health"
echo ""

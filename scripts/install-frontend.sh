#!/bin/bash

# ============================================
# THE OLD SHINOBI - Instalação do Frontend
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
echo "🎨 Instalando Frontend (Next.js)"
echo "============================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "revista-portal/package.json" ]; then
    echo -e "${RED}✗ Erro: Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

cd revista-portal

echo -e "${BLUE}📦 Instalando dependências do frontend...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}🔐 Configurando variáveis de ambiente...${NC}"

if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠ Arquivo .env.local já existe${NC}"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}→ Mantendo .env.local existente${NC}"
        echo ""
        echo -e "${GREEN}✓ Frontend configurado!${NC}"
        exit 0
    fi
fi

# Perguntar URL da API
echo ""
read -p "URL da API (http://localhost:3000): " API_URL
API_URL=${API_URL:-http://localhost:3000}

# Criar arquivo .env.local
cat > .env.local << EOF
# URL da API Backend
NEXT_PUBLIC_API_URL=$API_URL
EOF

echo ""
echo -e "${GREEN}✓ Arquivo .env.local criado com sucesso!${NC}"
echo ""

# Testar se a API está acessível
echo -e "${BLUE}🔍 Testando conexão com a API...${NC}"
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ API está acessível!${NC}"
    else
        echo -e "${YELLOW}⚠ API não está respondendo (código: $HTTP_CODE)${NC}"
        echo -e "${YELLOW}→ Certifique-se de iniciar o backend antes do frontend${NC}"
    fi
else
    echo -e "${YELLOW}⚠ curl não instalado, pulando teste de conexão${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✓ Frontend instalado com sucesso!${NC}"
echo "============================================"
echo ""
echo "Próximos passos:"
echo "1. Certifique-se que o backend está rodando"
echo "2. Inicie o servidor: cd revista-portal && npm run dev"
echo "3. Acesse: http://localhost:3001"
echo ""

#!/bin/bash

# ============================================
# THE OLD SHINOBI - Verificação de Requisitos
# ============================================

set -e

echo "============================================"
echo "🔍 Verificando Requisitos do Sistema"
echo "============================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0
WARNINGS=0

# Função para verificar versão mínima do Node
check_node_version() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            echo -e "${GREEN}✓${NC} Node.js instalado: $(node -v)"
            return 0
        else
            echo -e "${RED}✗${NC} Node.js $(node -v) - Versão mínima requerida: v18.0.0"
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} Node.js não encontrado"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Função para verificar versão mínima do npm
check_npm_version() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v | cut -d'.' -f1)
        if [ "$NPM_VERSION" -ge 9 ]; then
            echo -e "${GREEN}✓${NC} npm instalado: $(npm -v)"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} npm $(npm -v) - Versão recomendada: v9.0.0+"
            WARNINGS=$((WARNINGS + 1))
            return 0
        fi
    else
        echo -e "${RED}✗${NC} npm não encontrado"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "📦 Verificando Node.js e npm:"
echo "-----------------------------------"
check_node_version
check_npm_version
echo ""

echo "🗄️ Verificando PostgreSQL:"
echo "-----------------------------------"
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓${NC} PostgreSQL Client (psql) instalado: $PSQL_VERSION"
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL Client (psql) não encontrado localmente"
    echo -e "  ${YELLOW}→${NC} Isso não é um problema se você usar o Supabase (recomendado)."
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "🔧 Verificando ferramentas opcionais:"
echo "-----------------------------------"
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} Git instalado: $(git --version)"
else
    echo -e "${YELLOW}⚠${NC} Git não encontrado (recomendado para controle de versão)"
    WARNINGS=$((WARNINGS + 1))
fi

if command -v curl &> /dev/null; then
    echo -e "${GREEN}✓${NC} curl instalado: $(curl --version | head -1)"
else
    echo -e "${YELLOW}⚠${NC} curl não encontrado (recomendado para testes de API)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "============================================"
echo "📊 Resumo da Verificação"
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os requisitos obrigatórios foram atendidos!${NC}"
else
    echo -e "${RED}✗ $ERRORS requisito(s) obrigatório(s) não atendido(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS aviso(s) - verifique as recomendações acima${NC}"
fi
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 Sistema pronto para instalação!${NC}"
    exit 0
else
    echo -e "${RED}❌ Por favor, instale os requisitos faltantes antes de continuar.${NC}"
    echo ""
    echo "Instruções de instalação:"
    echo "  - Node.js (v18+): https://nodejs.org/"
    echo ""
    exit 1
fi
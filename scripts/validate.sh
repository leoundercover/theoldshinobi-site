#!/bin/bash

# ============================================
# THE OLD SHINOBI - Script de Validação
# ============================================

# Descobrir raiz do projeto e garantir execução a partir dela
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}║        ${BOLD}THE OLD SHINOBI${NC}${CYAN}                ║${NC}"
echo -e "${CYAN}║    Validação da Aplicação v1.0.0       ║${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# ============================================
# 1. VERIFICAR ESTRUTURA DE ARQUIVOS
# ============================================
echo -e "${BLUE}[1/5] Verificando estrutura de arquivos...${NC}"
echo ""

if [ ! -d "revista-cms-api" ]; then
    echo -e "${RED}✗ Diretório revista-cms-api não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Diretório revista-cms-api encontrado${NC}"
fi

if [ ! -d "revista-portal" ]; then
    echo -e "${RED}✗ Diretório revista-portal não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Diretório revista-portal encontrado${NC}"
fi

if [ ! -f "revista-cms-api/.env" ]; then
    echo -e "${RED}✗ Arquivo .env não encontrado no backend${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Arquivo .env encontrado no backend${NC}"
fi

if [ ! -f "revista-portal/.env.local" ]; then
    echo -e "${RED}✗ Arquivo .env.local não encontrado no frontend${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Arquivo .env.local encontrado no frontend${NC}"
fi

# ============================================
# 2. VERIFICAR DEPENDÊNCIAS
# ============================================
echo ""
echo -e "${BLUE}[2/5] Verificando dependências...${NC}"
echo ""

if [ ! -d "revista-cms-api/node_modules" ]; then
    echo -e "${RED}✗ Dependências do backend não instaladas${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Dependências do backend instaladas${NC}"
fi

if [ ! -d "revista-portal/node_modules" ]; then
    echo -e "${RED}✗ Dependências do frontend não instaladas${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Dependências do frontend instaladas${NC}"
fi

# ============================================
# 3. VERIFICAR PORTAS
# ============================================
echo ""
echo -e "${BLUE}[3/5] Verificando portas...${NC}"
echo ""

BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend rodando na porta 3000${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠ Backend não está rodando na porta 3000${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend rodando na porta 3001${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠ Frontend não está rodando na porta 3001${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ============================================
# 4. TESTAR ENDPOINTS
# ============================================
echo ""
echo -e "${BLUE}[4/5] Testando endpoints...${NC}"
echo ""

if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${CYAN}→ Testando backend health check (timeout: 5s)...${NC}"
    
    HEALTH_RESPONSE=$(curl -sf --max-time 5 http://localhost:3000/health 2>&1)
    HEALTH_EXIT=$?
    
    if [ $HEALTH_EXIT -eq 0 ]; then
        echo -e "${GREEN}✓ Backend health check OK${NC}"
        echo -e "${CYAN}  → $HEALTH_RESPONSE${NC}"
    else
        echo -e "${RED}✗ Backend não responde ao health check${NC}"
        if [ $HEALTH_EXIT -eq 28 ]; then
            echo -e "${YELLOW}  → Erro: Timeout após 5 segundos${NC}"
        else
            echo -e "${YELLOW}  → Erro curl code: $HEALTH_EXIT${NC}"
        fi
        echo -e "${CYAN}  → Verifique: tail -f logs/backend.log${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Testar rota de autenticação
    echo -e "${CYAN}→ Testando rota de autenticação (timeout: 5s)...${NC}"
    STATUS=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/login 2>/dev/null)
    AUTH_EXIT=$?
    
    if [ $AUTH_EXIT -eq 0 ]; then
        if [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "200" ]; then
            echo -e "${GREEN}✓ Rota de autenticação acessível (status: $STATUS)${NC}"
        else
            echo -e "${YELLOW}⚠ Rota de autenticação retornou status inesperado: $STATUS${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ Erro ao testar rota de autenticação (timeout ou erro de rede)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Backend não está rodando, pulando testes de endpoint${NC}"
fi

if [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${CYAN}→ Testando frontend (timeout: 10s)...${NC}"
    
    FRONTEND_RESPONSE=$(curl -sf --max-time 10 http://localhost:3001 2>&1)
    FRONTEND_EXIT=$?
    
    if [ $FRONTEND_EXIT -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend acessível${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend não responde${NC}"
        if [ $FRONTEND_EXIT -eq 28 ]; then
            echo -e "${YELLOW}  → Erro: Timeout após 10 segundos${NC}"
        else
            echo -e "${YELLOW}  → Erro curl code: $FRONTEND_EXIT${NC}"
        fi
        echo -e "${CYAN}  → Verifique: tail -f logs/frontend.log${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Frontend não está rodando, pulando testes${NC}"
fi

# ============================================
# 5. VERIFICAR BANCO DE DADOS
# ============================================
echo ""
echo -e "${BLUE}[5/5] Verificando conexão com banco de dados...${NC}"
echo ""

if [ -f "revista-cms-api/.env" ]; then
    cd revista-cms-api
    
    # Testar conexão com o banco
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
        console.log('✓ Conexão com banco de dados OK');
        pool.end();
        process.exit(0);
      })
      .catch(err => {
        console.error('✗ Erro ao conectar ao banco:', err.message);
        pool.end();
        process.exit(1);
      });
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Banco de dados conectado${NC}"
    else
        echo -e "${RED}✗ Erro ao conectar ao banco de dados${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    cd ..
fi

# ============================================
# RESUMO
# ============================================
echo ""
echo "============================================"
echo -e "${BOLD}📊 Resumo da Validação${NC}"
echo "============================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    echo -e "${GREEN}✓ Aplicação está pronta para uso${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS aviso(s) encontrado(s)${NC}"
    echo -e "${YELLOW}→ A aplicação pode funcionar, mas verifique os avisos${NC}"
else
    echo -e "${RED}✗ $ERRORS erro(s) encontrado(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS aviso(s) encontrado(s)${NC}"
    fi
    echo ""
    echo -e "${YELLOW}💡 Sugestões:${NC}"
    echo "  1. Execute ./install.sh para configurar"
    echo "  2. Execute ./start.sh para iniciar os servidores"
    echo "  3. Verifique os logs em: logs/backend.log e logs/frontend.log"
fi

echo ""

exit $ERRORS

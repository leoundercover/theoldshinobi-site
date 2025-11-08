#!/bin/bash

# ============================================
# THE OLD SHINOBI - Script para Parar
# ============================================

# Descobrir raiz do projeto e garantir execução a partir dela
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/logs"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}🛑 Encerrando aplicação...${NC}"
echo ""

# Parar processos salvos
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend encerrado (PID: $BACKEND_PID)${NC}"
    fi
    rm -f "$LOG_DIR/backend.pid"
fi

if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend encerrado (PID: $FRONTEND_PID)${NC}"
    fi
    rm -f "$LOG_DIR/frontend.pid"
fi

# Matar processos nas portas como fallback
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -ti:3000)
    kill -9 $PID 2>/dev/null || true
    echo -e "${GREEN}✓ Processo na porta 3000 encerrado${NC}"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -ti:3001)
    kill -9 $PID 2>/dev/null || true
    echo -e "${GREEN}✓ Processo na porta 3001 encerrado${NC}"
fi

echo ""
echo -e "${GREEN}✓ Aplicação encerrada com sucesso!${NC}"
echo ""

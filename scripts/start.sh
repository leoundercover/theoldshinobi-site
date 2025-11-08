#!/bin/bash

# ============================================
# THE OLD SHINOBI - Script de Inicialização
# ============================================

set -e

# Descobrir raiz do projeto e garantir execução a partir dela
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/logs"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Banner
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}║        ${BOLD}THE OLD SHINOBI${NC}${CYAN}                ║${NC}"
echo -e "${CYAN}║    Inicializando Aplicação v1.0.0      ║${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Verificar estrutura esperada
if [ ! -d "revista-cms-api" ] || [ ! -d "revista-portal" ]; then
    echo -e "${RED}✗ Erro: Estrutura do projeto não encontrada em $ROOT_DIR${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f "revista-cms-api/.env" ]; then
    echo -e "${RED}✗ Erro: Arquivo .env não encontrado no backend${NC}"
    echo -e "${YELLOW}💡 Execute ./scripts/install.sh primeiro${NC}"
    exit 1
fi

if [ ! -f "revista-portal/.env.local" ]; then
    echo -e "${RED}✗ Erro: Arquivo .env.local não encontrado no frontend${NC}"
    echo -e "${YELLOW}💡 Execute ./scripts/install.sh primeiro${NC}"
    exit 1
fi

# Verificar se as portas estão livres
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Porta 3000 já está em uso${NC}"
    read -p "Deseja matar o processo? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        PID=$(lsof -ti:3000)
        kill -9 $PID 2>/dev/null || true
        echo -e "${GREEN}✓ Processo na porta 3000 encerrado${NC}"
    else
        echo -e "${RED}✗ Não é possível iniciar o backend${NC}"
        exit 1
    fi
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Porta 3001 já está em uso${NC}"
    read -p "Deseja matar o processo? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        PID=$(lsof -ti:3001)
        kill -9 $PID 2>/dev/null || true
        echo -e "${GREEN}✓ Processo na porta 3001 encerrado${NC}"
    else
        echo -e "${RED}✗ Não é possível iniciar o frontend${NC}"
        exit 1
    fi
fi

echo ""
echo "============================================"
echo -e "${BLUE}🚀 Iniciando Aplicação${NC}"
echo "============================================"
echo ""

# Criar diretório de logs
mkdir -p "$LOG_DIR"

# Iniciar Backend
echo -e "${BLUE}[1/2] Iniciando Backend...${NC}"
cd "$ROOT_DIR/revista-cms-api"
npm run dev > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$ROOT_DIR"

# Aguardar backend iniciar
echo -e "${YELLOW}→ Aguardando backend inicializar...${NC}"
sleep 3

# Verificar se backend está rodando
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${RED}✗ Erro ao iniciar backend${NC}"
    echo -e "${YELLOW}→ Verifique os logs em: logs/backend.log${NC}"
    exit 1
fi

# Testar endpoint do backend
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend iniciado com sucesso (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Backend iniciado mas não responde ao health check${NC}"
    echo -e "${YELLOW}→ Verifique os logs em: logs/backend.log${NC}"
fi

# Iniciar Frontend
echo ""
echo -e "${BLUE}[2/2] Iniciando Frontend...${NC}"
cd "$ROOT_DIR/revista-portal"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$ROOT_DIR"

# Aguardar frontend iniciar
echo -e "${YELLOW}→ Aguardando frontend inicializar...${NC}"
sleep 5

# Verificar se frontend está rodando
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo -e "${RED}✗ Erro ao iniciar frontend${NC}"
    echo -e "${YELLOW}→ Verifique os logs em: logs/frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ Frontend iniciado com sucesso (PID: $FRONTEND_PID)${NC}"

# Salvar PIDs para posterior encerramento
echo $BACKEND_PID > "$LOG_DIR/backend.pid"
echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"

echo ""
echo "============================================"
echo -e "${GREEN}✓ Aplicação Iniciada com Sucesso!${NC}"
echo "============================================"
echo ""
echo -e "${BOLD}📍 URLs:${NC}"
echo -e "  Backend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  Frontend: ${CYAN}http://localhost:3001${NC}"
echo ""
echo -e "${BOLD}📋 Comandos úteis:${NC}"
echo -e "  Parar aplicação:  ${CYAN}./scripts/stop.sh${NC}"
echo -e "  Ver logs backend: ${CYAN}tail -f logs/backend.log${NC}"
echo -e "  Ver logs frontend: ${CYAN}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}💡 Para criar um usuário admin:${NC}"
echo -e "   ${CYAN}cd revista-cms-api && npm run create-admin${NC}"
echo ""
echo -e "${GREEN}Pressione Ctrl+C para encerrar os processos${NC}"
echo ""

# Função para encerrar processos ao pressionar Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando aplicação...${NC}"
    
    if [ -f "$LOG_DIR/backend.pid" ]; then
        BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend encerrado${NC}"
    fi
    
    if [ -f "$LOG_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend encerrado${NC}"
    fi
    
    rm -f "$LOG_DIR/backend.pid" "$LOG_DIR/frontend.pid"
    echo ""
    echo -e "${GREEN}✓ Aplicação encerrada com sucesso!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Aguardar indefinidamente
wait

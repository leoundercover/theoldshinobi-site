#!/bin/bash

# ==============================================================================
# Script de Inicialização - The Old Shinobi
#
# Inicia os servidores do backend e do frontend em segundo plano.
# Os logs são salvos no diretório 'logs/'.
#
# Uso: ./start.sh
# ==============================================================================

# --- Cores para o output ---
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

TICK="[${COLOR_GREEN}✓${COLOR_RESET}]"
INFO="[${COLOR_BLUE}i${COLOR_RESET}]"

# --- Variáveis do Projeto ---
PROJECT_ROOT=$(pwd)
BACKEND_DIR="revista-cms-api"
FRONTEND_DIR="revista-portal"
LOG_DIR="logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

echo -e "${COLOR_BLUE}--- Iniciando Servidores The Old Shinobi ---${COLOR_RESET}"

# Cria o diretório de logs se ele não existir
mkdir -p "$LOG_DIR"

# --- Inicia o Servidor Backend ---
echo -e "\n${INFO} Iniciando Backend (API)..."
cd "$BACKEND_DIR"
# O comando 'nohup' garante que o processo continue rodando mesmo se o terminal for fechado.
# 'npm run dev' inicia o servidor.
# '> "$PROJECT_ROOT/$BACKEND_LOG" 2>&1' redireciona stdout e stderr para o arquivo de log.
# '&' executa o comando em segundo plano.
nohup npm run dev > "$PROJECT_ROOT/$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"
echo -e " ${TICK} Backend iniciado com PID: ${COLOR_YELLOW}$BACKEND_PID${COLOR_RESET}. Logs em ${COLOR_YELLOW}$BACKEND_LOG${COLOR_RESET}."

# --- Inicia o Servidor Frontend ---
echo -e "\n${INFO} Iniciando Frontend (Portal)..."
cd "$FRONTEND_DIR"
nohup npm run dev > "$PROJECT_ROOT/$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"
echo -e " ${TICK} Frontend iniciado com PID: ${COLOR_YELLOW}$FRONTEND_PID${COLOR_RESET}. Logs em ${COLOR_YELLOW}$FRONTEND_LOG${COLOR_RESET}."

echo -e "\n${COLOR_GREEN}🎉 Servidores iniciados com sucesso!${COLOR_RESET}"
echo -e "   - Backend (API) rodando na porta ${COLOR_YELLOW}3000${COLOR_RESET}."
echo -e "   - Frontend (Portal) rodando na porta ${COLOR_YELLOW}3001${COLOR_RESET}."
echo -e "\nPara ver os logs em tempo real, use:"
echo -e "   ${COLOR_YELLOW}tail -f logs/backend.log${COLOR_RESET}"
echo -e "   ${COLOR_YELLOW}tail -f logs/frontend.log${COLOR_RESET}"
echo -e "\nPara parar todos os servidores, execute: ${COLOR_YELLOW}./scripts/stop.sh${COLOR_RESET}\n"
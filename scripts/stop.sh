#!/bin/bash

# ==============================================================================
# Script de Finalização - The Old Shinobi
#
# Para os servidores do backend e do frontend que estão rodando nas portas
# 3000 e 3001, iniciados pelo start.sh.
#
# Uso: ./scripts/stop.sh
# ==============================================================================

# --- Cores para o output ---
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

TICK="[${COLOR_GREEN}✓${COLOR_RESET}]"
CROSS="[${COLOR_RED}✗${COLOR_RESET}]"
INFO="[${COLOR_BLUE}i${COLOR_RESET}]"

# --- Portas dos Serviços ---
BACKEND_PORT=3000
FRONTEND_PORT=3001

# --- Função para parar um processo pela porta ---
stop_process_on_port() {
  local PORT=$1
  local SERVICE_NAME=$2

  echo -e "\n${INFO} Verificando a porta ${COLOR_YELLOW}$PORT${COLOR_RESET} para o serviço ${COLOR_YELLOW}$SERVICE_NAME${COLOR_RESET}..."

  # lsof -ti :<port> retorna o PID do processo que está usando a porta.
  # A saída de erro é redirecionada para /dev/null para não poluir o terminal.
  PID=$(lsof -ti :$PORT 2>/dev/null)

  if [ -n "$PID" ]; then
    echo -e "   -> Processo encontrado com PID: ${COLOR_YELLOW}$PID${COLOR_RESET}. Encerrando..."
    # kill -9 envia o sinal SIGKILL para forçar o encerramento imediato.
    kill -9 $PID
    echo -e "   ${TICK} Serviço ${SERVICE_NAME} parado com sucesso."
  else
    echo -e "   ${TICK} Nenhum serviço encontrado rodando na porta ${PORT}."
  fi
}

echo -e "${COLOR_BLUE}--- Parando Servidores The Old Shinobi ---${COLOR_RESET}"

stop_process_on_port $BACKEND_PORT "Backend (API)"
stop_process_on_port $FRONTEND_PORT "Frontend (Portal)"

echo -e "\n${COLOR_GREEN}🎉 Verificação concluída. Todos os serviços foram encerrados.${COLOR_RESET}\n"
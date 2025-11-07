#!/bin/bash

# ============================================
# THE OLD SHINOBI - Instalação Completa
# ============================================
# Este script automatiza a instalação completa
# da aplicação The Old Shinobi (Backend + Frontend)
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}║        ${BOLD}THE OLD SHINOBI${NC}${CYAN}                ║${NC}"
echo -e "${CYAN}║    Instalação Automática v1.0.0        ║${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Sistema de Gerenciamento de Quadrinhos${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ] && [ ! -f "revista-cms-api/package.json" ]; then
    echo -e "${RED}✗ Erro: Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

# Dar permissão de execução aos scripts
chmod +x scripts/*.sh 2>/dev/null || true

echo "============================================"
echo "📋 Opções de Instalação"
echo "============================================"
echo ""
echo "1) Instalação completa (Backend + Frontend)"
echo "2) Apenas Backend (API REST)"
echo "3) Apenas Frontend (Next.js)"
echo "4) Apenas verificar requisitos"
echo "5) Sair"
echo ""

read -p "Escolha uma opção (1-5): " OPTION

case $OPTION in
    1)
        echo ""
        echo -e "${BOLD}═══ Instalação Completa ═══${NC}"
        echo ""

        # Passo 1: Verificar requisitos
        echo -e "${BLUE}[1/4] Verificando requisitos...${NC}"
        bash scripts/check-requirements.sh
        if [ $? -ne 0 ]; then
            exit 1
        fi
        echo ""

        # Passo 2: Instalar backend
        echo -e "${BLUE}[2/4] Instalando backend...${NC}"
        bash scripts/install-backend.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Erro na instalação do backend${NC}"
            exit 1
        fi
        echo ""

        # Passo 3: Instalar frontend
        echo -e "${BLUE}[3/4] Instalando frontend...${NC}"
        bash scripts/install-frontend.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Erro na instalação do frontend${NC}"
            exit 1
        fi
        echo ""

        # Passo 4: Instruções finais
        echo -e "${BLUE}[4/4] Finalizando...${NC}"
        echo ""
        echo "============================================"
        echo -e "${GREEN}✓ Instalação Concluída com Sucesso!${NC}"
        echo "============================================"
        echo ""
        echo -e "${BOLD}📝 Próximos Passos:${NC}"
        echo ""
        echo "1. Execute o SQL no Supabase:"
        echo "   - Acesse: https://app.supabase.com"
        echo "   - Vá em: SQL Editor"
        echo "   - Cole o conteúdo de: supabase-schema.sql"
        echo "   - Execute o SQL"
        echo ""
        echo "2. Inicie o Backend (em um terminal):"
        echo "   ${CYAN}cd revista-cms-api${NC}"
        echo "   ${CYAN}npm run dev${NC}"
        echo ""
        echo "3. Inicie o Frontend (em outro terminal):"
        echo "   ${CYAN}cd revista-portal${NC}"
        echo "   ${CYAN}npm run dev${NC}"
        echo ""
        echo "4. Acesse a aplicação:"
        echo "   Backend:  ${CYAN}http://localhost:3000${NC}"
        echo "   Frontend: ${CYAN}http://localhost:3001${NC}"
        echo ""
        echo "5. Crie um usuário admin:"
        echo "   ${CYAN}cd revista-cms-api${NC}"
        echo "   ${CYAN}npm run create-admin${NC}"
        echo ""
        echo -e "${YELLOW}💡 Dica: Leia o arquivo INSTALL.md para mais informações${NC}"
        echo ""
        ;;

    2)
        echo ""
        echo -e "${BOLD}═══ Instalação do Backend ═══${NC}"
        echo ""
        bash scripts/check-requirements.sh && bash scripts/install-backend.sh
        ;;

    3)
        echo ""
        echo -e "${BOLD}═══ Instalação do Frontend ═══${NC}"
        echo ""
        bash scripts/check-requirements.sh && bash scripts/install-frontend.sh
        ;;

    4)
        echo ""
        bash scripts/check-requirements.sh
        ;;

    5)
        echo ""
        echo "Instalação cancelada."
        exit 0
        ;;

    *)
        echo -e "${RED}✗ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Obrigado por usar The Old Shinobi!${NC}"
echo ""

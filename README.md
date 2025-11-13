# THE OLD SHINOBI

Monorepo para o sistema de gerenciamento de quadrinhos e revistas.

## 📚 Documentação
- Visão geral: docs/README.md
- Instalação: docs/INSTALL.md
- Quick Start: docs/QUICK_START.md

## 🚀 Scripts (raiz do projeto)
- Instalação (interativo):
  - ./scripts/install.sh
- Iniciar backend e frontend (dev):
  - ./scripts/start.sh
- Parar tudo:
  - ./scripts/stop.sh
- Validar setup (estrutura, dependências, portas, endpoints, DB):
  - ./scripts/validate.sh

## 📦 Estrutura (resumo)
```
theoldshinobi-site/
├── docs/                 # Documentação (.md)
├── revista-cms-api/      # Backend (Node.js + Express + PostgreSQL)
├── revista-portal/       # Frontend (Next.js + TypeScript + Tailwind)
├── scripts/              # Scripts (install, start, stop, validate)
├── logs/                 # Logs da aplicação
└── WARP.md               # Regras do Warp
```

## 🔗 URLs padrão
- Backend API: http://localhost:3000 (health: /health)
- Frontend: http://localhost:3001

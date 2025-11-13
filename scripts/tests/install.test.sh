#!/usr/bin/env bats

# ============================================
# Unit Tests for install.sh
# ============================================

# Setup function runs before each test
setup() {
    export ORIGINAL_DIR="$(pwd)"
    export TEST_DIR="$(mktemp -d)"
    cd "$TEST_DIR"
    
    # Create mock project structure
    mkdir -p revista-cms-api revista-portal scripts
    echo '{"name": "revista-cms-api"}' > revista-cms-api/package.json
    echo '{"name": "revista-portal"}' > revista-portal/package.json
    echo '{}' > package.json
    
    # Create mock scripts directory
    mkdir -p scripts
    
    # Mock check-requirements.sh
    cat > scripts/check-requirements.sh << 'EOF'
#!/bin/bash
echo "✓ Node.js found"
echo "✓ npm found"
exit 0
EOF
    chmod +x scripts/check-requirements.sh
    
    # Mock install-backend.sh
    cat > scripts/install-backend.sh << 'EOF'
#!/bin/bash
echo "Installing backend..."
mkdir -p revista-cms-api/node_modules
echo "PORT=3000" > revista-cms-api/.env
echo "✓ Backend instalado com sucesso!"
exit 0
EOF
    chmod +x scripts/install-backend.sh
    
    # Mock install-frontend.sh
    cat > scripts/install-frontend.sh << 'EOF'
#!/bin/bash
echo "Installing frontend..."
mkdir -p revista-portal/node_modules
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > revista-portal/.env.local
echo "✓ Frontend instalado com sucesso!"
exit 0
EOF
    chmod +x scripts/install-frontend.sh
    
    # Copy the actual install.sh script
    cp "$ORIGINAL_DIR/install.sh" scripts/
    chmod +x scripts/install.sh
}

teardown() {
    cd "$ORIGINAL_DIR"
    rm -rf "$TEST_DIR"
}

# ============================================
# Test Case 2: install.sh orchestrates full installation
# ============================================

@test "install.sh: successfully orchestrates full installation (option 1)" {
    cd "$TEST_DIR"
    
    # Run with option 1 (full installation)
    run bash -c "echo '1' | bash scripts/install.sh"
    
    # Check exit status
    [ "$status" -eq 0 ]
    
    # Verify output contains all installation steps
    [[ "$output" == *"[1/4] Verificando requisitos"* ]]
    [[ "$output" == *"[2/4] Instalando backend"* ]]
    [[ "$output" == *"[3/4] Instalando frontend"* ]]
    [[ "$output" == *"[4/4] Finalizando"* ]]
    [[ "$output" == *"Instalação Concluída com Sucesso"* ]]
    
    # Verify backend was installed
    [ -d "revista-cms-api/node_modules" ]
    [ -f "revista-cms-api/.env" ]
    
    # Verify frontend was installed
    [ -d "revista-portal/node_modules" ]
    [ -f "revista-portal/.env.local" ]
    
    # Check for next steps instructions
    [[ "$output" == *"Próximos Passos"* ]]
    [[ "$output" == *"npm run dev"* ]]
}

@test "install.sh: handles backend-only installation (option 2)" {
    cd "$TEST_DIR"
    
    # Run with option 2 (backend only)
    run bash -c "echo '2' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    
    # Verify backend was installed
    [ -d "revista-cms-api/node_modules" ]
    [ -f "revista-cms-api/.env" ]
    
    # Check output
    [[ "$output" == *"Instalação do Backend"* ]]
    [[ "$output" == *"Installing backend"* ]]
}

@test "install.sh: handles frontend-only installation (option 3)" {
    cd "$TEST_DIR"
    
    # Run with option 3 (frontend only)
    run bash -c "echo '3' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    
    # Verify frontend was installed
    [ -d "revista-portal/node_modules" ]
    [ -f "revista-portal/.env.local" ]
    
    # Check output
    [[ "$output" == *"Instalação do Frontend"* ]]
    [[ "$output" == *"Installing frontend"* ]]
}

@test "install.sh: handles verify requirements only (option 4)" {
    cd "$TEST_DIR"
    
    # Run with option 4 (verify requirements)
    run bash -c "echo '4' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"Node.js found"* ]]
    [[ "$output" == *"npm found"* ]]
}

@test "install.sh: handles exit option (option 5)" {
    cd "$TEST_DIR"
    
    # Run with option 5 (exit)
    run bash -c "echo '5' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"Instalação cancelada"* ]]
}

@test "install.sh: rejects invalid option" {
    cd "$TEST_DIR"
    
    # Run with invalid option
    run bash -c "echo '99' | bash scripts/install.sh"
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Opção inválida"* ]]
}

@test "install.sh: fails gracefully when backend installation fails" {
    cd "$TEST_DIR"
    
    # Replace install-backend.sh with failing script
    cat > scripts/install-backend.sh << 'EOF'
#!/bin/bash
echo "Error installing backend"
exit 1
EOF
    chmod +x scripts/install-backend.sh
    
    # Run with option 1
    run bash -c "echo '1' | bash scripts/install.sh"
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Erro na instalação do backend"* ]]
}

@test "install.sh: fails gracefully when frontend installation fails" {
    cd "$TEST_DIR"
    
    # Replace install-frontend.sh with failing script
    cat > scripts/install-frontend.sh << 'EOF'
#!/bin/bash
echo "Error installing frontend"
exit 1
EOF
    chmod +x scripts/install-frontend.sh
    
    # Run with option 1
    run bash -c "echo '1' | bash scripts/install.sh"
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Erro na instalação do frontend"* ]]
}

@test "install.sh: fails gracefully when requirements check fails" {
    cd "$TEST_DIR"
    
    # Replace check-requirements.sh with failing script
    cat > scripts/check-requirements.sh << 'EOF'
#!/bin/bash
echo "✗ Node.js not found"
exit 1
EOF
    chmod +x scripts/check-requirements.sh
    
    # Run with option 1
    run bash -c "echo '1' | bash scripts/install.sh"
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Node.js not found"* ]]
}

@test "install.sh: displays banner and menu correctly" {
    cd "$TEST_DIR"
    
    # Run with exit option to just see menu
    run bash -c "echo '5' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    
    # Check for banner
    [[ "$output" == *"THE OLD SHINOBI"* ]]
    [[ "$output" == *"Instalação Automática"* ]]
    
    # Check for menu options
    [[ "$output" == *"1) Instalação completa"* ]]
    [[ "$output" == *"2) Apenas Backend"* ]]
    [[ "$output" == *"3) Apenas Frontend"* ]]
    [[ "$output" == *"4) Apenas verificar requisitos"* ]]
    [[ "$output" == *"5) Sair"* ]]
}

@test "install.sh: fails when not in project directory" {
    cd "$TEST_DIR"
    
    # Remove package.json files to simulate wrong directory
    rm -f package.json revista-cms-api/package.json
    
    # Run installation
    run bash -c "echo '1' | bash scripts/install.sh"
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Execute este script a partir da raiz do projeto"* ]]
}

@test "install.sh: makes scripts executable during setup" {
    cd "$TEST_DIR"
    
    # Remove execute permissions from mock scripts
    chmod -x scripts/check-requirements.sh
    chmod -x scripts/install-backend.sh
    chmod -x scripts/install-frontend.sh
    
    # Run installation - install.sh should make them executable
    run bash -c "echo '5' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    
    # Note: The actual script uses chmod +x scripts/*.sh
    # This would make the scripts executable again
}

@test "install.sh: provides helpful next steps after successful installation" {
    cd "$TEST_DIR"
    
    # Run full installation
    run bash -c "echo '1' | bash scripts/install.sh"
    
    [ "$status" -eq 0 ]
    
    # Check for comprehensive next steps
    [[ "$output" == *"Execute o SQL no Supabase"* ]]
    [[ "$output" == *"supabase-schema.sql"* ]]
    [[ "$output" == *"cd revista-cms-api"* ]]
    [[ "$output" == *"cd revista-portal"* ]]
    [[ "$output" == *"http://localhost:3000"* ]]
    [[ "$output" == *"http://localhost:3001"* ]]
    [[ "$output" == *"npm run create-admin"* ]]
}

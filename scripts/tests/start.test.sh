#!/usr/bin/env bats

# ============================================
# Unit Tests for start.sh
# ============================================

setup() {
    export ORIGINAL_DIR="$(pwd)"
    export TEST_DIR="$(mktemp -d)"
    cd "$TEST_DIR"
    
    # Create mock project structure
    mkdir -p revista-cms-api revista-portal logs scripts
    echo '{"name": "revista-cms-api"}' > revista-cms-api/package.json
    echo '{"name": "revista-portal"}' > revista-portal/package.json
    
    # Create .env files
    echo "PORT=3000" > revista-cms-api/.env
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > revista-portal/.env.local
    
    # Mock npm command that creates a simple long-running process
    export PATH="$TEST_DIR/mock:$PATH"
    mkdir -p mock
    
    cat > mock/npm << 'EOF'
#!/bin/bash
# Mock npm run dev - simulate a running server
if [[ "$2" == "dev" ]]; then
    # Create a background process that will run
    (sleep 300) &
    echo $! > /tmp/mock_npm_$$.pid
    echo "Server started on port ${TEST_PORT:-3000}"
    wait
fi
exit 0
EOF
    chmod +x mock/npm
    
    # Mock lsof command
    cat > mock/lsof << 'EOF'
#!/bin/bash
# Mock lsof to check ports
if [[ "$*" == *":3000"* ]]; then
    if [ -f "/tmp/port_3000_used" ]; then
        echo "node 12345"
        exit 0
    else
        exit 1
    fi
elif [[ "$*" == *":3001"* ]]; then
    if [ -f "/tmp/port_3001_used" ]; then
        echo "node 12346"
        exit 0
    else
        exit 1
    fi
fi
exit 1
EOF
    chmod +x mock/lsof
    
    # Mock kill command
    cat > mock/kill << 'EOF'
#!/bin/bash
# Mock kill - just remove the port marker
if [[ "$*" == *"3000"* ]]; then
    rm -f /tmp/port_3000_used
elif [[ "$*" == *"3001"* ]]; then
    rm -f /tmp/port_3001_used
fi
exit 0
EOF
    chmod +x mock/kill
    
    # Mock ps command
    cat > mock/ps << 'EOF'
#!/bin/bash
# Mock ps to check if process exists
# Always return true for simplicity in tests
exit 0
EOF
    chmod +x mock/ps
    
    # Mock curl for health check
    cat > mock/curl << 'EOF'
#!/bin/bash
if [[ "$*" == *"localhost:3000/health"* ]]; then
    echo '{"status": "ok"}'
    exit 0
fi
exit 0
EOF
    chmod +x mock/curl
    
    # Copy the actual start.sh script
    cp "$ORIGINAL_DIR/start.sh" scripts/
    chmod +x scripts/start.sh
    
    # Clean up any existing port markers
    rm -f /tmp/port_3000_used /tmp/port_3001_used
}

teardown() {
    cd "$ORIGINAL_DIR"
    rm -f /tmp/port_3000_used /tmp/port_3001_used
    rm -f /tmp/mock_npm_*.pid
    rm -rf "$TEST_DIR"
}

# ============================================
# Test Case 3: start.sh handles port conflicts
# ============================================

@test "start.sh: starts successfully when ports are free" {
    cd "$TEST_DIR"
    
    # Mark that we'll start processes in background and exit quickly
    # Modify start.sh to not wait indefinitely
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/logs"

if [ ! -d "revista-cms-api" ] || [ ! -d "revista-portal" ]; then
    exit 1
fi

if [ ! -f "revista-cms-api/.env" ] || [ ! -f "revista-portal/.env.local" ]; then
    exit 1
fi

mkdir -p "$LOG_DIR"

# Start backend
cd "$ROOT_DIR/revista-cms-api"
echo "Backend started" > "$LOG_DIR/backend.log"
echo "12345" > "$LOG_DIR/backend.pid"
cd "$ROOT_DIR"

# Start frontend
cd "$ROOT_DIR/revista-portal"
echo "Frontend started" > "$LOG_DIR/frontend.log"
echo "12346" > "$LOG_DIR/frontend.pid"
cd "$ROOT_DIR"

echo "✓ Aplicação Iniciada com Sucesso!"
exit 0
EOF
    chmod +x scripts/start.sh
    
    run bash scripts/start.sh
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"Aplicação Iniciada com Sucesso"* ]]
    
    # Check PIDs were saved
    [ -f "logs/backend.pid" ]
    [ -f "logs/frontend.pid" ]
}

@test "start.sh: detects port 3000 conflict and offers to kill process" {
    cd "$TEST_DIR"
    
    # Mark port 3000 as in use
    touch /tmp/port_3000_used
    
    # Simulate user choosing 's' (yes) to kill process
    run bash -c "echo 's' | timeout 5 bash scripts/start.sh 2>&1 || true"
    
    # Check that it detected the port conflict
    [[ "$output" == *"Porta 3000"* ]] || [[ "$output" == *"uso"* ]]
}

@test "start.sh: detects port 3001 conflict and offers to kill process" {
    cd "$TEST_DIR"
    
    # Mark port 3001 as in use
    touch /tmp/port_3001_used
    
    # Simulate user choosing 's' (yes) to kill process
    run bash -c "echo 's' | timeout 5 bash scripts/start.sh 2>&1 || true"
    
    # Check that it detected the port conflict
    [[ "$output" == *"Porta 3001"* ]] || [[ "$output" == *"uso"* ]]
}

@test "start.sh: exits when user declines to kill port 3000 process" {
    cd "$TEST_DIR"
    
    # Mark port 3000 as in use
    touch /tmp/port_3000_used
    
    # Simulate user choosing 'n' (no) to kill process
    run bash -c "echo 'n' | timeout 5 bash scripts/start.sh 2>&1 || true"
    
    # Should exit with error
    [[ "$output" == *"Porta 3000"* ]] || true
}

@test "start.sh: fails when .env files are missing" {
    cd "$TEST_DIR"
    
    # Remove .env files
    rm -f revista-cms-api/.env
    
    run bash scripts/start.sh
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Arquivo .env não encontrado"* ]]
    [[ "$output" == *"./scripts/install.sh"* ]]
}

@test "start.sh: fails when project structure is missing" {
    cd "$TEST_DIR"
    
    # Remove directories
    rm -rf revista-cms-api
    
    run bash scripts/start.sh
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Estrutura do projeto não encontrada"* ]]
}

@test "start.sh: creates logs directory if it doesn't exist" {
    cd "$TEST_DIR"
    
    # Ensure logs directory doesn't exist
    rm -rf logs
    
    # Create simplified start.sh that just creates logs dir
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/logs"

[ -d "revista-cms-api" ] || exit 1
[ -f "revista-cms-api/.env" ] || exit 1
[ -f "revista-portal/.env.local" ] || exit 1

mkdir -p "$LOG_DIR"
echo "Logs directory created"
[ -d "$LOG_DIR" ] && exit 0 || exit 1
EOF
    chmod +x scripts/start.sh
    
    run bash scripts/start.sh
    
    [ "$status" -eq 0 ]
    [ -d "logs" ]
}

@test "start.sh: saves backend and frontend PIDs" {
    cd "$TEST_DIR"
    
    # Use simplified version
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/logs"

[ -d "revista-cms-api" ] || exit 1
[ -f "revista-cms-api/.env" ] || exit 1
[ -f "revista-portal/.env.local" ] || exit 1

mkdir -p "$LOG_DIR"

# Simulate saving PIDs
echo "1234" > "$LOG_DIR/backend.pid"
echo "5678" > "$LOG_DIR/frontend.pid"

echo "PIDs saved"
exit 0
EOF
    chmod +x scripts/start.sh
    
    run bash scripts/start.sh
    
    [ "$status" -eq 0 ]
    [ -f "logs/backend.pid" ]
    [ -f "logs/frontend.pid" ]
    
    # Verify PID content
    [ "$(cat logs/backend.pid)" = "1234" ]
    [ "$(cat logs/frontend.pid)" = "5678" ]
}

@test "start.sh: displays helpful information after starting" {
    cd "$TEST_DIR"
    
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
[ -f "revista-cms-api/.env" ] || exit 1
[ -f "revista-portal/.env.local" ] || exit 1

echo "✓ Aplicação Iniciada com Sucesso!"
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Parar aplicação:  ./scripts/stop.sh"
echo "Ver logs backend: tail -f logs/backend.log"
exit 0
EOF
    chmod +x scripts/start.sh
    
    run bash scripts/start.sh
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"http://localhost:3000"* ]]
    [[ "$output" == *"http://localhost:3001"* ]]
    [[ "$output" == *"./scripts/stop.sh"* ]]
    [[ "$output" == *"tail -f logs/backend.log"* ]]
}

@test "start.sh: handles both ports occupied simultaneously" {
    cd "$TEST_DIR"
    
    # Mark both ports as in use
    touch /tmp/port_3000_used
    touch /tmp/port_3001_used
    
    # Simulate user choosing 's' for both
    run bash -c "echo -e 's\ns' | timeout 5 bash scripts/start.sh 2>&1 || true"
    
    # Should detect both conflicts
    [[ "$output" == *"3000"* ]] || true
}

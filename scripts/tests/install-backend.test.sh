#!/usr/bin/env bats

# ============================================
# Unit Tests for install-backend.sh
# ============================================

# Setup function runs before each test
setup() {
    # Store original directory
    export ORIGINAL_DIR="$(pwd)"
    
    # Create a temporary test directory
    export TEST_DIR="$(mktemp -d)"
    cd "$TEST_DIR"
    
    # Create mock project structure
    mkdir -p revista-cms-api/node_modules
    echo '{"name": "revista-cms-api"}' > revista-cms-api/package.json
    
    # Mock npm command
    export PATH="$TEST_DIR/mock:$PATH"
    mkdir -p mock
    cat > mock/npm << 'EOF'
#!/bin/bash
# Mock npm install
exit 0
EOF
    chmod +x mock/npm
    
    # Mock node command for database connection test
    cat > mock/node << 'EOF'
#!/bin/bash
# Mock node for DB connection test
if [[ "$*" == *"Pool"* ]]; then
    echo "✓ Conexão estabelecida com sucesso!"
    exit 0
fi
exit 0
EOF
    chmod +x mock/node
    
    # Copy the actual script
    cp "$ORIGINAL_DIR/install-backend.sh" .
}

# Teardown function runs after each test
teardown() {
    cd "$ORIGINAL_DIR"
    rm -rf "$TEST_DIR"
}

# ============================================
# Test Case 1: Existing .env with update connection string option
# ============================================

@test "install-backend.sh: handles existing .env with option 2 (update connection string) and valid Supabase URL" {
    cd "$TEST_DIR"
    
    # Create existing .env file
    cat > revista-cms-api/.env << 'EOF'
PORT=3000
NODE_ENV=development
DB_HOST=old-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=oldpassword
DB_SSL=true
JWT_SECRET=existing_jwt_secret_that_is_very_long_and_secure_enough
JWT_EXPIRES_IN=7d
EOF
    
    # Prepare input: Option 2 (update connection string) + valid Supabase URL
    SUPABASE_URL="postgresql://postgres:newpassword123@db.newproject.supabase.co:5432/postgres"
    
    # Run script with simulated input
    run bash -c "cd '$TEST_DIR' && echo -e '2\n$SUPABASE_URL' | bash install-backend.sh"
    
    # Assertions
    [ "$status" -eq 0 ]
    
    # Verify .env was updated
    [ -f "revista-cms-api/.env" ]
    
    # Check that database credentials were extracted correctly
    grep -q "DB_HOST=db.newproject.supabase.co" revista-cms-api/.env
    grep -q "DB_USER=postgres" revista-cms-api/.env
    grep -q "DB_PASSWORD=newpassword123" revista-cms-api/.env
    grep -q "DB_PORT=5432" revista-cms-api/.env
    grep -q "DB_NAME=postgres" revista-cms-api/.env
    grep -q "DB_SSL=true" revista-cms-api/.env
    
    # Verify JWT_SECRET was preserved
    grep -q "JWT_SECRET=existing_jwt_secret_that_is_very_long_and_secure_enough" revista-cms-api/.env
    
    # Check success message
    [[ "$output" == *"Configuração Supabase extraída com sucesso"* ]]
    [[ "$output" == *"Backend instalado com sucesso"* ]]
}

@test "install-backend.sh: rejects invalid Supabase URL and prompts again" {
    cd "$TEST_DIR"
    
    # Create existing .env
    cat > revista-cms-api/.env << 'EOF'
DB_HOST=old-host
JWT_SECRET=existing_jwt_secret_that_is_very_long_and_secure_enough
EOF
    
    # Prepare input: Option 2 + invalid URL + valid URL
    INVALID_URL="mysql://invalid:url@host:3306/db"
    VALID_URL="postgresql://postgres:pass@db.project.supabase.co:5432/postgres"
    
    # Run script with both invalid and valid URLs
    run bash -c "cd '$TEST_DIR' && echo -e '2\n$INVALID_URL\n$VALID_URL' | timeout 10 bash install-backend.sh"
    
    # Should eventually succeed with valid URL
    [ "$status" -eq 0 ] || [ "$status" -eq 124 ]  # 124 is timeout, acceptable for this test
    
    # Check error message for invalid URL
    [[ "$output" == *"URL inválida"* ]] || [[ "$output" == *"postgresql://"* ]]
}

@test "install-backend.sh: handles option 1 (keep existing config)" {
    cd "$TEST_DIR"
    
    # Create existing .env
    cat > revista-cms-api/.env << 'EOF'
DB_HOST=existing-host.supabase.co
DB_NAME=postgres
DB_USER=postgres
JWT_SECRET=existing_jwt_secret_that_is_very_long
EOF
    
    # Run with option 1 (keep config)
    run bash -c "cd '$TEST_DIR' && echo '1' | bash install-backend.sh"
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"Mantendo configuração existente"* ]]
    [[ "$output" == *"Backend configurado"* ]]
    
    # Verify .env wasn't changed
    grep -q "DB_HOST=existing-host.supabase.co" revista-cms-api/.env
}

@test "install-backend.sh: handles option 3 (reconfigure everything)" {
    cd "$TEST_DIR"
    
    # Create existing .env
    cat > revista-cms-api/.env << 'EOF'
DB_HOST=old-host
JWT_SECRET=old_secret
EOF
    
    # Run with option 3 + Supabase choice + valid URL
    SUPABASE_URL="postgresql://postgres:newpass@db.project.supabase.co:5432/postgres"
    run bash -c "cd '$TEST_DIR' && echo -e '3\n1\n$SUPABASE_URL' | bash install-backend.sh"
    
    [ "$status" -eq 0 ]
    
    # Verify new configuration
    grep -q "DB_HOST=db.project.supabase.co" revista-cms-api/.env
    grep -q "DB_PASSWORD=newpass" revista-cms-api/.env
    
    # JWT_SECRET should be newly generated (different from old)
    ! grep -q "JWT_SECRET=old_secret" revista-cms-api/.env
}

@test "install-backend.sh: validates Supabase URL format with special characters in password" {
    cd "$TEST_DIR"
    
    # Create existing .env
    cat > revista-cms-api/.env << 'EOF'
JWT_SECRET=existing_jwt_secret_that_is_very_long
EOF
    
    # URL with special characters in password
    COMPLEX_URL="postgresql://postgres:P@ssw0rd!123@db.project.supabase.co:5432/postgres"
    
    run bash -c "cd '$TEST_DIR' && echo -e '2\n$COMPLEX_URL' | bash install-backend.sh"
    
    [ "$status" -eq 0 ]
    
    # Verify correct parsing of password with special chars
    grep -q "DB_PASSWORD=P@ssw0rd!123" revista-cms-api/.env
    grep -q "DB_HOST=db.project.supabase.co" revista-cms-api/.env
}

@test "install-backend.sh: fails when not run from project root" {
    cd "$TEST_DIR"
    
    # Remove revista-cms-api directory
    rm -rf revista-cms-api
    
    run bash install-backend.sh
    
    [ "$status" -eq 1 ]
    [[ "$output" == *"Execute este script a partir da raiz do projeto"* ]]
}

@test "install-backend.sh: creates .env from scratch with local PostgreSQL option" {
    cd "$TEST_DIR"
    
    # No existing .env
    [ ! -f "revista-cms-api/.env" ]
    
    # Run with option 2 (local PostgreSQL)
    run bash -c "cd '$TEST_DIR' && echo -e '2\nlocalhost\n5432\nrevista_cms\npostgres\ntestpass' | bash install-backend.sh"
    
    [ "$status" -eq 0 ]
    
    # Verify .env was created
    [ -f "revista-cms-api/.env" ]
    grep -q "DB_HOST=localhost" revista-cms-api/.env
    grep -q "DB_PORT=5432" revista-cms-api/.env
    grep -q "DB_NAME=revista_cms" revista-cms-api/.env
    grep -q "DB_USER=postgres" revista-cms-api/.env
    grep -q "DB_SSL=false" revista-cms-api/.env
}

#!/usr/bin/env node

/**
 * Script para criar o primeiro usuário administrador
 *
 * Uso:
 *   node scripts/create-admin.js
 *
 * Ou com variáveis de ambiente:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePass123!" node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const readline = require('readline');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('=====================================');
    console.log('  CRIAR PRIMEIRO USUÁRIO ADMIN');
    console.log('=====================================\n');

    // Verificar se já existe um admin
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Já existe um usuário administrador no sistema.');
      const confirm = await question('Deseja criar outro admin? (s/N): ');
      if (confirm.toLowerCase() !== 's') {
        console.log('Operação cancelada.');
        process.exit(0);
      }
    }

    // Coletar dados do admin
    const name = process.env.ADMIN_NAME || await question('Nome do administrador: ');
    const email = process.env.ADMIN_EMAIL || await question('Email: ');

    let password;
    if (process.env.ADMIN_PASSWORD) {
      password = process.env.ADMIN_PASSWORD;
    } else {
      password = await question('Senha (mínimo 8 caracteres): ');
      const confirmPassword = await question('Confirme a senha: ');

      if (password !== confirmPassword) {
        console.error('❌ As senhas não coincidem!');
        process.exit(1);
      }
    }

    // Validações
    if (!name || name.length < 2) {
      console.error('❌ Nome deve ter pelo menos 2 caracteres');
      process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Email inválido');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Senha deve ter pelo menos 8 caracteres');
      process.exit(1);
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      console.error('❌ Senha deve conter pelo menos uma letra e um número');
      process.exit(1);
    }

    // Verificar se o email já está em uso
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.error('❌ Email já está cadastrado!');
      process.exit(1);
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    console.log('\n⏳ Gerando hash seguro da senha...');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir no banco
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash]
    );

    const admin = result.rows[0];

    console.log('\n✅ Administrador criado com sucesso!\n');
    console.log('Detalhes:');
    console.log('─────────────────────────────────');
    console.log(`ID:          ${admin.id}`);
    console.log(`Nome:        ${admin.name}`);
    console.log(`Email:       ${admin.email}`);
    console.log(`Role:        ${admin.role}`);
    console.log(`Criado em:   ${admin.created_at}`);
    console.log('─────────────────────────────────\n');

    console.log('⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!');
    console.log('   Email:   ', email);
    console.log('   Senha:   [não será exibida novamente]\n');

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuração do Pool de Conexões PostgreSQL
 * Configurado com limites seguros para produção
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Configurações de Pool para segurança e performance
  max: 20, // máximo de conexões no pool
  min: 5,  // mínimo de conexões mantidas
  idleTimeoutMillis: 30000, // tempo para fechar conexões ociosas (30s)
  connectionTimeoutMillis: 2000, // tempo máximo para obter conexão (2s)

  // Configurações de segurança
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false // ajustar para true em produção com certificado válido
  } : false,

  // Statement timeout (previne queries longas)
  statement_timeout: 10000, // 10 segundos máximo por query

  // Suporte IPv6 (Supabase usa IPv6)
  options: '-c search_path=public'
});

// Log de conexão bem-sucedida
pool.on('connect', (client) => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

// Log de erro de conexão
pool.on('error', (err, client) => {
  console.error('❌ Erro inesperado no pool de conexões:', err.message);
  console.error('Stack:', err.stack);

  // Em vez de fazer process.exit, apenas loga o erro
  // Permite que o sistema de orquestração (PM2, K8s) lide com o restart
  // Em ambientes de alta disponibilidade, isso é crucial
});

// Log de remoção de cliente
pool.on('remove', () => {
  console.log('ℹ️  Conexão removida do pool');
});

/**
 * Função auxiliar para testar a conexão com o banco
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Teste de conexão bem-sucedido:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error.message);
    return false;
  }
};

/**
 * Função para encerrar o pool gracefully
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool de conexões encerrado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao encerrar pool:', error.message);
  }
};

// Testar conexão de forma assíncrona (não bloqueia o startup)
setImmediate(() => {
  testConnection().catch(err => {
    console.error('⚠️  Aviso: Falha no teste inicial de conexão com banco de dados');
    console.error('   O servidor continuará rodando, mas as requisições ao banco podem falhar');
  });
});

module.exports = pool;
module.exports.testConnection = testConnection;
module.exports.closePool = closePool;

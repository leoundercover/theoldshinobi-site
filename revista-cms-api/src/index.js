const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// ========================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ========================================
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Configure estas variáveis no arquivo .env');
  process.exit(1);
}

// Validar força do JWT_SECRET
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ ERRO: JWT_SECRET deve ter no mínimo 32 caracteres');
  console.error('💡 Gere um secret forte com: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente validadas com sucesso');

// ========================================
// IMPORTAÇÕES
// ========================================
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const titleRoutes = require('./routes/titleRoutes');
const issueRoutes = require('./routes/issueRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// SEGURANÇA: HELMET (Security Headers)
// ========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Permite embeds de PDFs
}));

// ========================================
// SEGURANÇA: CORS Restritivo
// ========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========================================
// SEGURANÇA: HTTPS Enforcement (Produção)
// ========================================
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================
app.use(express.json({ limit: '10mb' })); // Limitar tamanho do body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use('/api/', apiLimiter);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API está funcionando',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ROTAS DA API
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', ratingRoutes);
app.use('/api/favorites', favoriteRoutes);

// ========================================
// ROTA 404
// ========================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================
app.use(errorHandler);

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} recebido. Encerrando servidor gracefully...`);

  server.close(() => {
    console.log('✅ Servidor HTTP fechado');
    console.log('✅ Conexões de banco encerradas');
    process.exit(0);
  });

  // Força o encerramento após 10 segundos
  setTimeout(() => {
    console.error('⚠️  Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ========================================
// INICIAR SERVIDOR
// ========================================
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Servidor iniciado com sucesso!');
  console.log('========================================');
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Segurança: Helmet ✓ | CORS ✓ | Rate Limit ✓`);
  console.log('========================================');
});

module.exports = app;

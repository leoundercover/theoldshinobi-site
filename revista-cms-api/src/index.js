const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const titleRoutes = require('./routes/titleRoutes');
const issueRoutes = require('./routes/issueRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', ratingRoutes);
app.use('/api/favorites', favoriteRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

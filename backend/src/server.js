require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Conexão com MongoDB
mongoose.set('debug', true); // Habilita logs do Mongoose
console.log('Tentando conectar ao MongoDB...');
console.log('URI do MongoDB:', process.env.MONGODB_URI?.replace(/mongodb:\/\/.*@/, 'mongodb://****@'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('=== Conexão com MongoDB estabelecida com sucesso ===');
  console.log('Estado da conexão:', mongoose.connection.readyState);
  console.log('Nome do banco:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Porta:', mongoose.connection.port);
})
.catch((err) => {
  console.error('=== Erro ao conectar ao MongoDB ===');
  console.error('Tipo do erro:', err.constructor.name);
  console.error('Mensagem:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Eventos de conexão do MongoDB
mongoose.connection.on('error', (err) => {
  console.error('=== Erro na conexão com MongoDB ===');
  console.error('Tipo do erro:', err.constructor.name);
  console.error('Mensagem:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('=== Desconectado do MongoDB ===');
});

mongoose.connection.on('reconnected', () => {
  console.log('=== Reconectado ao MongoDB ===');
});

// Middleware para tratamento de erros do Mongoose
app.use((err, req, res, next) => {
  console.error('=== Erro na aplicação ===');
  console.error('Tipo:', err.constructor.name);
  console.error('Mensagem:', err.message);
  console.error('Stack:', err.stack);
  
  // Erro de validação do Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Erro de validação',
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    });
  }
  
  // Erro de cast do Mongoose (ex: ID inválido)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: 'Erro de formato de dados',
      field: err.path,
      value: err.value,
      type: err.kind
    });
  }
  
  // Outros erros do Mongoose
  if (err instanceof mongoose.Error) {
    return res.status(400).json({
      message: 'Erro do MongoDB',
      error: err.message,
      type: err.constructor.name
    });
  }
  
  // Erro genérico
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: err.message,
    type: err.constructor.name
  });
});

// Rotas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Variáveis de ambiente carregadas:', {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI?.replace(/mongodb:\/\/.*@/, 'mongodb://****@')
  });
}); 
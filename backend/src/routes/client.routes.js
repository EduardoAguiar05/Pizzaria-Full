const router = require('express').Router();
const Client = require('../models/Client');
const { verifyToken } = require('../middlewares/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort('-createdAt');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover cliente' });
  }
});

module.exports = router; 
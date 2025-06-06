const router = require('express').Router();
const auth = require('../middlewares/auth');
const Client = require('../models/Client');

// Listar todos os clientes
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter cliente por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Criar cliente
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const client = new Client({
      name,
      phone,
      address
    });

    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Placeholder para rotas de clientes
router.get('/', auth, (req, res) => {
    res.json({ message: 'Rota de clientes' });
});

module.exports = router; 
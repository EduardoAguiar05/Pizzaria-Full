const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

// Criar novo produto (apenas admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

// Atualizar produto (apenas admin)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

// Deletar produto (apenas admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover produto' });
  }
});

// Atualizar disponibilidade do produto
router.patch('/:id/availability', async (req, res) => {
  try {
    const { available } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar disponibilidade do produto' });
  }
});

module.exports = router; 
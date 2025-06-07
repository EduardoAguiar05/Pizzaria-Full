const router = require('express').Router();
const auth = require('../middlewares/auth');
const Product = require('../models/Product');

// Listar todos os produtos
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Criar produto (apenas admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { name, description, price, category, ingredients, image } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      category,
      ingredients,
      image
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar produto (apenas admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { name, description, price, category, ingredients, image, available } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, ingredients, image, available },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Deletar produto (apenas admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Placeholder para rotas de produtos
router.get('/', auth, (req, res) => {
    res.json({ message: 'Rota de produtos' });
});

module.exports = router; 
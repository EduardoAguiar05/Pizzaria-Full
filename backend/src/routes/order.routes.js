const router = require('express').Router();
const Order = require('../models/Order');
const { verifyToken } = require('../middlewares/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Listar todos os pedidos
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('client', 'name phone')
      .populate('items.product', 'name price')
      .populate('createdBy', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos' });
  }
});

// Buscar pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name phone address')
      .populate('items.product', 'name price')
      .populate('createdBy', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
});

// Criar novo pedido
router.post('/', async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    await order.populate([
      { path: 'client', select: 'name phone' },
      { path: 'items.product', select: 'name price' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido' });
  }
});

// Atualizar status do pedido
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('client', 'name phone')
    .populate('items.product', 'name price')
    .populate('createdBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status do pedido' });
  }
});

// Cancelar pedido
router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    )
    .populate('client', 'name phone')
    .populate('items.product', 'name price')
    .populate('createdBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar pedido' });
  }
});

module.exports = router; 
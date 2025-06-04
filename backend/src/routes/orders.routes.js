const router = require('express').Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');

// Listar todos os pedidos
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('client', 'name phone')
      .populate('items.product', 'name price');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter pedido por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name phone')
      .populate('items.product', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Criar pedido
router.post('/', auth, async (req, res) => {
  try {
    const { client, items, paymentMethod, observations } = req.body;
    
    // Calcula o total do pedido
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const order = new Order({
      client,
      items,
      total,
      paymentMethod,
      observations
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone')
      .populate('items.product', 'name price');

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar status do pedido
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('client', 'name phone')
    .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar pedido
router.put('/:id', auth, async (req, res) => {
  try {
    const { items, paymentMethod, observations } = req.body;
    
    // Calcula o novo total
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { items, total, paymentMethod, observations },
      { new: true }
    )
    .populate('client', 'name phone')
    .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Deletar pedido (apenas admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router; 
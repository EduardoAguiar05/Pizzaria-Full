const router = require('express').Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');

// Listar todos os pedidos
router.get('/', auth, async (req, res) => {
  try {
    console.log('Buscando pedidos...');
    const orders = await Order.find()
      .populate({
        path: 'client',
        select: 'name phone address'
      })
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .sort({ createdAt: -1 }); // Ordenar do mais recente para o mais antigo

    console.log('Pedidos encontrados:', orders.length);
    console.log('Exemplo do primeiro pedido:', orders[0]);
    
    res.json(orders);
  } catch (err) {
    console.error('Erro ao listar pedidos:', err);
    res.status(500).json({ message: 'Erro ao listar pedidos', error: err.message });
  }
});

// Obter pedido por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'client',
        select: 'name phone address'
      })
      .populate({
        path: 'items.product',
        select: 'name price'
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Erro ao buscar pedido:', err);
    res.status(500).json({ message: 'Erro ao buscar pedido', error: err.message });
  }
});

// Criar pedido
router.post('/', auth, async (req, res) => {
  try {
    console.log('Dados recebidos para criar pedido:', req.body);
    
    const { client, items, paymentMethod, observations } = req.body;
    
    // Validações básicas
    if (!client || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        details: {
          client: !client ? 'Cliente é obrigatório' : null,
          items: !items || items.length === 0 ? 'Pelo menos um item é obrigatório' : null
        }
      });
    }

    // Calcula o total do pedido
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const order = new Order({
      client,
      items,
      total,
      paymentMethod,
      observations,
      createdBy: req.user?._id // Opcional agora
    });

    await order.save();
    
    // Retorna o pedido populado
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'client',
        select: 'name phone address'
      })
      .populate({
        path: 'items.product',
        select: 'name price'
      });

    console.log('Pedido criado com sucesso:', populatedOrder);
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ 
      message: 'Erro ao criar pedido', 
      error: err.message,
      details: err.errors
    });
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
    .populate({
      path: 'client',
      select: 'name phone address'
    })
    .populate({
      path: 'items.product',
      select: 'name price'
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    res.status(500).json({ message: 'Erro ao atualizar status', error: err.message });
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

// Placeholder para rotas de pedidos
router.get('/', auth, (req, res) => {
    res.json({ message: 'Rota de pedidos' });
});

module.exports = router; 
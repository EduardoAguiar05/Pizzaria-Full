const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');
const { body, param, validationResult } = require('express-validator');

// Validações comuns
const orderValidations = [
  body('client').notEmpty().withMessage('Cliente é obrigatório'),
  body('items').isArray().withMessage('Items devem ser um array'),
  body('items.*.product').notEmpty().withMessage('Produto é obrigatório'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que 0'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Preço deve ser maior ou igual a 0'),
  body('paymentMethod').isIn(['dinheiro', 'cartão', 'pix']).withMessage('Método de pagamento inválido'),
  body('observations').optional().isString().isLength({ max: 500 }).withMessage('Observações muito longas')
];

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar pedidos
router.get('/', auth, async (req, res) => {
  try {
    console.log('Buscando pedidos...');
    const orders = await Order.find()
      .populate({
        path: 'client',
        select: 'name phone address email'
      })
      .populate({
        path: 'items.product',
        select: 'name price description category'
      })
      .sort('-createdAt');
    
    console.log(`${orders.length} pedidos encontrados`);
    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ message: 'Erro ao buscar pedidos', error: err.message });
  }
});

// Obter pedido por ID
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('ID inválido')
], validate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name phone address')
      .populate('items.product', 'name price');
    
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
router.post('/', [auth, ...orderValidations], validate, async (req, res) => {
  try {
    const { client, items, paymentMethod, observations } = req.body;
    
    // Calcula o total
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const order = new Order({
      client,
      items,
      total,
      paymentMethod,
      observations,
      createdBy: req.user._id
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone address')
      .populate('items.product', 'name price');

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ message: 'Erro ao criar pedido', error: err.message });
  }
});

// Atualizar status do pedido
router.patch('/:id/status', [
  auth,
  param('id').isMongoId().withMessage('ID inválido'),
  body('status').isIn(['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'])
    .withMessage('Status inválido')
], validate, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Validações de transição de status
    if (order.status === 'cancelado') {
      return res.status(400).json({ message: 'Pedido cancelado não pode ser alterado' });
    }
    if (order.status === 'entregue' && status !== 'entregue') {
      return res.status(400).json({ message: 'Pedido entregue não pode ser alterado' });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone address')
      .populate('items.product', 'name price');

    res.json(populatedOrder);
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
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

// Cancelar pedido
router.patch('/:id/cancel', [
  auth,
  param('id').isMongoId().withMessage('ID inválido')
], validate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await order.cancel();

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone address')
      .populate('items.product', 'name price');

    res.json(populatedOrder);
  } catch (err) {
    console.error('Erro ao cancelar pedido:', err);
    
    if (err.message === 'Apenas pedidos pendentes podem ser cancelados') {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Erro ao cancelar pedido', error: err.message });
  }
});

module.exports = router; 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Cliente é obrigatório']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Produto é obrigatório']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      min: [1, 'Quantidade mínima é 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantidade deve ser um número inteiro'
      }
    },
    price: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo']
    }
  }],
  total: {
    type: Number,
    required: [true, 'Total é obrigatório'],
    min: [0, 'Total não pode ser negativo']
  },
  status: {
    type: String,
    enum: {
      values: ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'],
      message: 'Status {VALUE} não é válido'
    },
    default: 'pendente'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['dinheiro', 'cartão', 'pix'],
      message: 'Método de pagamento {VALUE} não é válido'
    },
    required: [true, 'Método de pagamento é obrigatório']
  },
  observations: {
    type: String,
    maxlength: [500, 'Observações não podem ter mais que 500 caracteres']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para validar itens
orderSchema.pre('save', function(next) {
  if (!this.items || this.items.length === 0) {
    next(new Error('Pedido deve ter pelo menos um item'));
  }
  next();
});

// Método para calcular total
orderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Método para verificar se pode ser cancelado
orderSchema.methods.canBeCancelled = function() {
  return this.status === 'pendente';
};

// Método para cancelar pedido
orderSchema.methods.cancel = function() {
  if (!this.canBeCancelled()) {
    throw new Error('Apenas pedidos pendentes podem ser cancelados');
  }
  this.status = 'cancelado';
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 
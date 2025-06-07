const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'A rua é obrigatória']
  },
  number: {
    type: String,
    required: [true, 'O número é obrigatório']
  },
  complement: {
    type: String,
    default: ''
  },
  neighborhood: {
    type: String,
    required: [true, 'O bairro é obrigatório']
  },
  city: {
    type: String,
    required: [true, 'A cidade é obrigatória']
  },
  state: {
    type: String,
    required: [true, 'O estado é obrigatório']
  },
  zipCode: {
    type: String,
    required: [true, 'O CEP é obrigatório'],
    validate: {
      validator: function(v) {
        return /^\d{5}-?\d{3}$/.test(v);
      },
      message: props => `${props.value} não é um CEP válido! Use o formato: 12345-678 ou 12345678`
    }
  }
});

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} não é um email válido!`
    }
  },
  phone: {
    type: String,
    required: [true, 'O telefone é obrigatório'],
    validate: {
      validator: function(v) {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(v);
      },
      message: props => `${props.value} não é um telefone válido! Use o formato: (99) 99999-9999`
    }
  },
  address: {
    type: addressSchema,
    required: [true, 'O endereço é obrigatório']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para formatar o telefone antes de salvar
clientSchema.pre('save', function(next) {
  // Se o telefone já estiver formatado, não faz nada
  if (/^\(\d{2}\) \d{5}-\d{4}$/.test(this.phone)) {
    return next();
  }

  // Remove tudo que não for número
  let phone = this.phone.replace(/\D/g, '');
  
  // Se tiver 11 dígitos, formata
  if (phone.length === 11) {
    this.phone = `(${phone.substring(0,2)}) ${phone.substring(2,7)}-${phone.substring(7)}`;
    next();
  } else {
    next(new Error('Telefone deve ter 11 dígitos'));
  }
});

// Middleware para formatar o CEP antes de salvar
clientSchema.pre('save', function(next) {
  // Se o CEP já estiver formatado, não faz nada
  if (/^\d{5}-\d{3}$/.test(this.address.zipCode)) {
    return next();
  }

  // Remove tudo que não for número
  let cep = this.address.zipCode.replace(/\D/g, '');
  
  // Se tiver 8 dígitos, formata
  if (cep.length === 8) {
    this.address.zipCode = `${cep.substring(0,5)}-${cep.substring(5)}`;
    next();
  } else {
    next(new Error('CEP deve ter 8 dígitos'));
  }
});

module.exports = mongoose.model('Client', clientSchema); 
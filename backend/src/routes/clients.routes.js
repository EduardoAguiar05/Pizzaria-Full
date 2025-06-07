const router = require('express').Router();
const auth = require('../middlewares/auth');
const Client = require('../models/Client');

// Listar todos os clientes
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ message: 'Erro ao listar clientes', error: err.message });
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
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ message: 'Erro ao buscar cliente', error: err.message });
  }
});

// Criar cliente
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== Iniciando cadastro de cliente ===');
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { name, email, phone, address } = req.body;
    
    // Validação básica
    if (!name || !phone || !address) {
      console.log('Campos obrigatórios faltando:', {
        name: !!name,
        phone: !!phone,
        address: !!address
      });
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando',
        required: ['name', 'phone', 'address'],
        received: req.body 
      });
    }

    // Validação do endereço
    const requiredAddressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    const missingFields = requiredAddressFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      console.log('Campos de endereço faltando:', {
        missingFields,
        receivedAddress: address
      });
      return res.status(400).json({ 
        message: 'Campos de endereço obrigatórios faltando',
        missingFields,
        receivedAddress: address 
      });
    }
    
    // Formatar telefone
    const formattedPhone = phone.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    
    // Formatar CEP
    const formattedZipCode = address.zipCode.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
    
    console.log('Criando nova instância do modelo Client');
    const client = new Client({
      name,
      email,
      phone: formattedPhone,
      address: {
        ...address,
        zipCode: formattedZipCode
      }
    });

    console.log('Validando modelo antes de salvar:', client.validateSync());
    console.log('Tentando salvar cliente:', JSON.stringify(client.toObject(), null, 2));
    
    await client.save();
    console.log('Cliente salvo com sucesso:', client._id);
    
    res.status(201).json(client);
  } catch (err) {
    console.error('=== Erro ao criar cliente ===');
    console.error('Tipo do erro:', err.constructor.name);
    console.error('Mensagem:', err.message);
    console.error('Stack:', err.stack);
    if (err.errors) {
      console.error('Erros de validação:', JSON.stringify(err.errors, null, 2));
    }
    
    // Se for erro de validação do Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }
    
    res.status(500).json({ 
      message: 'Erro ao criar cliente',
      error: err.message,
      type: err.constructor.name
    });
  }
});

// Atualizar cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Validação básica
    if (!name || !phone || !address) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando',
        required: ['name', 'phone', 'address'],
        received: req.body 
      });
    }

    // Validação do endereço
    const requiredAddressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    const missingFields = requiredAddressFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Campos de endereço obrigatórios faltando',
        missingFields,
        receivedAddress: address 
      });
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ 
      message: 'Erro ao atualizar cliente',
      error: err.message,
      stack: err.stack
    });
  }
});

// Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    res.status(500).json({ 
      message: 'Erro ao excluir cliente',
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router; 
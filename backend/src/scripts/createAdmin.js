const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não encontrado no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Conectado ao MongoDB');

    const adminData = {
      name: 'Administrador',
      email: 'admin@pizzaria.com',
      password: 'admin123',
      role: 'admin'
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Usuário admin já existe');
      process.exit(0);
    }

    const admin = await User.create(adminData);
    console.log('Usuário admin criado com sucesso:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

createAdminUser(); 
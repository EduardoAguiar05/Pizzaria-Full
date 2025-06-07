require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createInitialUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const existingUser = await User.findOne({ email: 'admin@pizzaria.com' });
    if (existingUser) {
      console.log('Usuário admin já existe');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const user = new User({
      name: 'Administrador',
      email: 'admin@pizzaria.com',
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();
    console.log('Usuário admin criado com sucesso');
    console.log('Email: admin@pizzaria.com');
    console.log('Senha: admin123');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createInitialUser(); 
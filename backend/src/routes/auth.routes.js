const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdmin } = require('../middlewares/auth.middleware');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    user.password = undefined;
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

// Registro (apenas admin pode criar novos usuários)
router.post('/register', isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee'
    });

    user.password = undefined;
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

module.exports = router; 
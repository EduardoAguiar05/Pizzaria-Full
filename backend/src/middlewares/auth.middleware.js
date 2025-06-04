const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  // Middleware para verificar token JWT
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  },

  // Middleware para verificar se o usuário é admin
  isAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    next();
  }
}; 
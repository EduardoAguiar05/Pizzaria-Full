const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Obtém o token do header
  const token = req.header('x-auth-token');

  // Verifica se não há token
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido.' });
  }
}; 
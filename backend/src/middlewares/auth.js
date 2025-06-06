const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Verifica se o token foi enviado no header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Verifica se o token está no formato correto
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const [scheme, token] = parts;
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Busca o usuário no banco
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Adiciona o usuário na requisição
        req.user = user;
        
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        console.error('Erro na autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}; 
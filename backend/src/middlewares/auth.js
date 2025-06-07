const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Verifica se o token foi enviado no header
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader);
        
        if (!authHeader) {
            console.log('Token não fornecido');
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Verifica se o token está no formato correto
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            console.log('Token mal formatado (partes):', parts);
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const [scheme, token] = parts;
        if (!/^Bearer$/i.test(scheme)) {
            console.log('Token mal formatado (scheme):', scheme);
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        // Verifica se o token é válido
        console.log('Verificando token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);
        
        // Busca o usuário no banco
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('Usuário não encontrado:', decoded.id);
            return res.status(401).json({ message: 'Token inválido' });
        }

        console.log('Usuário autenticado:', user.email);
        
        // Adiciona o usuário na requisição
        req.user = user;
        
        return next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}; 
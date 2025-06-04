# Sistema de Gerenciamento de Pizzaria

Sistema fullstack para gerenciamento de uma pizzaria, com funcionalidades de cadastro de clientes, produtos, pedidos e usuários.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- `backend/`: API REST em Node.js com Express e MongoDB
- `frontend/`: Interface web em HTML/CSS/JavaScript com Bootstrap

## Configuração do Backend

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pizzaria
JWT_SECRET=sua_chave_secreta_jwt
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Configuração do Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

### Autenticação
- Login/Logout
- Registro de usuários (apenas admin)
- Proteção de rotas

### Produtos
- Cadastro de pizzas, bebidas e sobremesas
- Controle de disponibilidade
- Preços e ingredientes

### Clientes
- Cadastro completo com endereço
- Gerenciamento de informações de contato

### Pedidos
- Seleção de cliente e produtos
- Cálculo automático de total
- Status de pedido
- Formas de pagamento
- Observações

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- MongoDB com Mongoose
- JWT para autenticação
- bcryptjs para criptografia
- cors para segurança

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Axios para requisições HTTP 
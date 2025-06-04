# Sistema de Pizzaria

Sistema fullstack para gerenciamento de pedidos de uma pizzaria.

## Pré-requisitos

- Node.js (versão LTS)
- MongoDB
- NPM ou Yarn

## Configuração

1. Clone este repositório
2. Instale as dependências do backend:
   ```bash
   cd backend
   npm install
   ```
3. Instale as dependências do frontend:
   ```bash
   cd frontend
   npm install
   ```
4. Crie um arquivo `.env` na pasta backend com o seguinte conteúdo:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pizzaria
   JWT_SECRET=sua_chave_secreta_jwt
   ```

## Executando o projeto

1. Inicie o MongoDB
2. Em um terminal, inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Em outro terminal, inicie o frontend:
   ```bash
   cd frontend
   npm start
   ```
4. Acesse o sistema em: http://localhost:1234

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de produtos (pizzas, bebidas, sobremesas)
- Cadastro de clientes
- Sistema de pedidos
- Status de pedidos
- Diferentes formas de pagamento 
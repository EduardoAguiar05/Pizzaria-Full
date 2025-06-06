import { api } from './js/api.js';
import { initAuth } from './js/auth.js';
import { initPedidos } from './js/pedidos.js';
import { initProdutos } from './js/produtos.js';
import { initClientes } from './js/clientes.js';

// Configura a URL base da API
api.setBaseURL('http://localhost:3001/api');

// Configura o interceptor de requisição para adicionar o token
api.setRequestInterceptor((config) => {
  const token = api.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initPedidos();
  initProdutos();
  initClientes();
  initRouter();
});

// Sistema de rotas
function initRouter() {
  const routes = {
    '': 'loginPage',
    '#pedidos': 'pedidosPage',
    '#produtos': 'produtosPage',
    '#clientes': 'clientesPage'
  };

  function showPage(pageId) {
    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(page => {
      page.classList.add('d-none');
    });
    
    // Mostra a página selecionada
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.remove('d-none');
    }
  }

  function handleRoute() {
    const hash = window.location.hash || '';
    const pageId = routes[hash];
    const token = api.getToken();
    
    // Se não estiver autenticado, redireciona para o login
    if (!token && hash !== '') {
      window.location.hash = '';
      return;
    }

    // Se estiver autenticado e tentar acessar o login, redireciona para pedidos
    if (token && hash === '') {
      window.location.hash = '#pedidos';
      return;
    }

    if (pageId) {
      showPage(pageId);
    }
  }

  // Atualiza a página quando mudar a rota
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// Interceptor para tratamento de erros
api.setResponseInterceptor(
  response => response,
  error => {
    if (error.response?.status === 401) {
      api.removeToken();
      window.location.hash = '';
    }
    return Promise.reject(error);
  }
); 
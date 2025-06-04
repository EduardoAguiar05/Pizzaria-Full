import { initAuth } from './auth.js';
import { initPedidos } from './pedidos.js';
import { initProdutos } from './produtos.js';
import { initClientes } from './clientes.js';
import { api } from './api.js';

// Inicialização do sistema
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
    document.querySelectorAll('.page').forEach(page => {
      page.classList.add('d-none');
    });
    document.getElementById(pageId)?.classList.remove('d-none');
  }

  function handleRoute() {
    const hash = window.location.hash || '';
    const pageId = routes[hash];
    
    if (!api.getToken() && hash !== '') {
      window.location.hash = '';
      return;
    }

    if (pageId) {
      showPage(pageId);
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// Configuração do Axios
api.setBaseURL('http://localhost:3000/api');

// Interceptor para adicionar token
api.setRequestInterceptor(config => {
  const token = api.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
import { api } from './js/api.js';
import { initAuth } from './js/auth.js';
import { initPedidos } from './js/pedidos.js';
import { initProdutos } from './js/produtos.js';
import { initClientes } from './js/clientes.js';

// Configura o interceptor de requisição para adicionar o token
api.setRequestInterceptor((config) => {
  const token = api.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Requisição sendo enviada:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    hasToken: !!token
  });
  return config;
}, error => {
  console.error('Erro no interceptor de requisição:', error);
  return Promise.reject(error);
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
    '#/login': 'loginPage',
    '#/pedidos': 'pedidosPage',
    '#/produtos': 'produtosPage',
    '#/clientes': 'clientesPage'
  };

  // Adiciona eventos de clique nos links de navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      console.log('Link clicado:', href);
      window.location.hash = href;
    });
  });

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
    const token = localStorage.getItem('token');
    
    // Se não estiver autenticado, redireciona para o login
    if (!token && hash !== '#/login' && hash !== '') {
      window.location.hash = '#/login';
      return;
    }

    // Se estiver autenticado e tentar acessar o login, redireciona para pedidos
    if (token && (hash === '#/login' || hash === '')) {
      window.location.hash = '#/pedidos';
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
  response => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('Token inválido ou expirado, redirecionando para login');
      api.removeToken();
      window.location.hash = '#/login';
    }

    // Se for erro de validação, mostra mensagem específica
    if (error.response?.status === 400) {
      const message = error.response.data.message || 'Dados inválidos';
      Swal.fire({
        icon: 'error',
        title: 'Erro de validação',
        text: message,
        html: `
          <div>
            <p>${message}</p>
            ${error.response.data.missingFields ? 
              `<p>Campos faltantes: ${error.response.data.missingFields.join(', ')}</p>` 
              : ''}
          </div>
        `
      });
    } else if (error.response?.status === 500) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no servidor',
        text: 'Ocorreu um erro ao processar sua requisição. Por favor, tente novamente.'
      });
    }

    return Promise.reject(error);
  }
); 
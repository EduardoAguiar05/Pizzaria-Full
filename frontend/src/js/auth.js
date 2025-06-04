import { api } from './api.js';

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Função para fazer login
async function login(email, password) {
    try {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        updateAuthUI();
        return true;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    updateAuthUI();
    window.location.href = '#/login';
}

// Função para registrar novo usuário
async function register(name, email, password) {
    try {
        const response = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', response.data.token);
        updateAuthUI();
        return true;
    } catch (error) {
        console.error('Erro no registro:', error);
        throw error;
    }
}

// Função para atualizar a UI baseado no estado de autenticação
function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    document.getElementById('loginItem').classList.toggle('d-none', isLoggedIn);
    document.getElementById('logoutItem').classList.toggle('d-none', !isLoggedIn);
}

// Renderiza o formulário de login
function renderLoginForm() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0">Login</h4>
                    </div>
                    <div class="card-body">
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Senha</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await login(email, password);
            window.location.href = '#/products';
        } catch (error) {
            alert('Erro no login. Verifique suas credenciais.');
        }
    });
}

// Event listener para o botão de logout
document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Inicializa o estado da UI de autenticação
updateAuthUI();

export function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const btnLogout = document.getElementById('btnLogout');
  const userInfo = document.getElementById('userInfo');

  // Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { user, token } = await api.login(email, password);
      api.setToken(token);
      
      userInfo.textContent = `Olá, ${user.name}`;
      window.location.hash = '#pedidos';
      
      Swal.fire({
        icon: 'success',
        title: 'Bem-vindo!',
        text: 'Login realizado com sucesso',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no login',
        text: 'Email ou senha inválidos'
      });
    }
  });

  // Logout
  btnLogout?.addEventListener('click', () => {
    Swal.fire({
      title: 'Deseja sair?',
      text: 'Você será desconectado do sistema',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {
      if (result.isConfirmed) {
        api.removeToken();
        window.location.hash = '';
        userInfo.textContent = '';
      }
    });
  });

  // Verifica autenticação inicial
  const token = api.getToken();
  if (!token) {
    window.location.hash = '';
  }
} 
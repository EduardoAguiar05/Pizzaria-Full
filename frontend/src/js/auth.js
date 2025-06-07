import { api } from './api.js';

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
    return api.getToken() !== null;
}

// Função para atualizar a UI baseado no estado de autenticação
function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    const loginItem = document.getElementById('loginItem');
    const logoutItem = document.getElementById('logoutItem');
    const navItems = document.querySelectorAll('.nav-item');
    const userInfo = document.getElementById('userInfo');

    if (loginItem) loginItem.classList.toggle('d-none', isLoggedIn);
    if (logoutItem) logoutItem.classList.toggle('d-none', !isLoggedIn);
    
    // Atualiza visibilidade dos itens de navegação
    navItems.forEach(item => {
        if (item) item.style.display = isLoggedIn ? 'block' : 'none';
    });

    // Se não estiver autenticado e não estiver na página de login, redireciona
    if (!isLoggedIn && window.location.hash !== '#/login') {
        window.location.hash = '#/login';
    }
}

// Função para fazer login
async function login(email, password) {
    try {
        const response = await api.login(email, password);
        api.setToken(response.token);
        
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.textContent = `Olá, ${response.user.name}`;

        await window.Swal.fire({
            icon: 'success',
            title: 'Bem-vindo!',
            text: 'Login realizado com sucesso',
            timer: 1500,
            showConfirmButton: false
        });

        window.location.hash = '#/pedidos';
        updateAuthUI();
        return true;
    } catch (error) {
        console.error('Erro no login:', error);
        await window.Swal.fire({
            icon: 'error',
            title: 'Erro no login',
            text: 'Email ou senha inválidos'
        });
        throw error;
    }
}

// Função para fazer logout
async function logout() {
    const result = await window.Swal.fire({
        title: 'Deseja sair?',
        text: 'Você será desconectado do sistema',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    });

    if (result.isConfirmed) {
        api.removeToken();
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.textContent = '';
        window.location.hash = '#/login';
        updateAuthUI();
    }
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

// Configura o formulário de login
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await login(email, password);
            } catch (error) {
                console.error('Erro no login:', error);
            }
        });
    }
}

// Inicializa o sistema de autenticação
export function initAuth() {
    // Configura o listener de logout
    const logoutLink = document.getElementById('logoutLink');
    const btnLogout = document.getElementById('btnLogout');

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Atualiza a UI inicial
    updateAuthUI();

    // Configura o formulário de login
    setupLoginForm();
} 
// Função para inicializar a aplicação
function initApp() {
    // Adiciona event listeners para navegação
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Verifica autenticação e redireciona
    if (!isAuthenticated() && !window.location.hash.includes('login')) {
        navigateTo('login');
        return;
    }

    // Roteamento baseado no hash da URL
    handleRoute();
}

// Função para navegação
function navigateTo(page) {
    window.location.hash = page;
    handleRoute();
}

// Função para lidar com as rotas
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'products';
    
    if (!isAuthenticated() && hash !== 'login') {
        navigateTo('login');
        return;
    }

    // Atualiza a navegação ativa
    document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.toggle('active', link.dataset.page === hash);
    });

    // Renderiza a página apropriada
    switch (hash) {
        case 'login':
            renderLoginForm();
            break;
        case 'products':
            renderProducts();
            break;
        case 'clients':
            renderClients();
            break;
        case 'orders':
            renderOrders();
            break;
        default:
            renderProducts();
    }
}

// Event listener para mudanças no hash da URL
window.addEventListener('hashchange', handleRoute);

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp); 
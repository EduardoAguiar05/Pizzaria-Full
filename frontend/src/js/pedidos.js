import { api } from './api.js';

let pedidos = [];
let clientes = [];
let produtos = [];

// Elementos do DOM
const elements = {
  pedidosTableBody: document.getElementById('pedidosTableBody'),
  novoPedidoForm: document.getElementById('novoPedidoForm'),
  novoPedidoModalElement: document.getElementById('novoPedidoModal'),
  novoPedidoModal: null, // Será inicializado após o DOM estar carregado
  clienteSelect: document.getElementById('clienteSelect'),
  produtosContainer: document.querySelector('.produtos-container'),
  addProdutoBtn: document.getElementById('addProdutoBtn'),
  novoPedidoBtn: document.querySelector('[data-bs-target="#novoPedidoModal"]'),
  paymentMethod: document.getElementById('paymentMethod'),
  observations: document.getElementById('observations')
};

// Estado da aplicação
const state = {
  loading: false,
  error: null,
  setLoading(value) {
    this.loading = value;
    // Atualizar UI com estado de loading
    document.body.style.cursor = value ? 'wait' : 'default';
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = value;
    });
  }
};

// Inicializar o modal e adicionar eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  if (elements.novoPedidoModalElement) {
    elements.novoPedidoModal = new bootstrap.Modal(elements.novoPedidoModalElement);
    
    // Adicionar evento para limpar o formulário quando o modal for fechado
    elements.novoPedidoModalElement.addEventListener('hidden.bs.modal', () => {
      elements.novoPedidoForm.reset();
      elements.produtosContainer.innerHTML = '';
    });
  }
});

// Carregar pedidos
async function loadPedidos() {
  try {
    state.setLoading(true);
    pedidos = await api.getPedidos();
    renderPedidos();
  } catch (error) {
    showError('Erro ao carregar pedidos', error);
  } finally {
    state.setLoading(false);
  }
}

// Carregar clientes e produtos
async function loadDependencies() {
  try {
    state.setLoading(true);
    const [clientesData, produtosData] = await Promise.all([
      api.getClientes(),
      api.getProdutos()
    ]);
    
    clientes = clientesData;
    produtos = produtosData.filter(p => p.available);
    
    renderClienteSelect();
    renderProdutoSelect();
  } catch (error) {
    showError('Erro ao carregar dados necessários', error);
  } finally {
    state.setLoading(false);
  }
}

// Renderizar tabela de pedidos
function renderPedidos() {
  if (!elements.pedidosTableBody) return;
  
  elements.pedidosTableBody.innerHTML = pedidos.map(pedido => {
    // Verifica se o pedido tem os dados necessários
    if (!pedido || !pedido.items || !pedido.client) {
      console.error('Pedido inválido:', pedido);
      return '';
    }

    // Formata os itens do pedido
    const itensFormatados = pedido.items
      .filter(item => item && item.product && item.product.name)
      .map(item => `${item.product.name} (${item.quantity}x)`)
      .join(', ') || 'Sem itens';

    const statusBadgeClass = {
      'pendente': 'bg-warning',
      'preparando': 'bg-info',
      'pronto': 'bg-success',
      'entregue': 'bg-primary',
      'cancelado': 'bg-danger'
    };

    return `
      <tr>
        <td>${pedido.client.name || 'Cliente não encontrado'}</td>
        <td>${itensFormatados}</td>
        <td>R$ ${pedido.total.toFixed(2)}</td>
        <td>
          <select class="form-select form-select-sm" 
            onchange="updateStatus('${pedido._id}', this.value)"
            ${pedido.status === 'cancelado' ? 'disabled' : ''}>
            <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="preparando" ${pedido.status === 'preparando' ? 'selected' : ''}>Preparando</option>
            <option value="pronto" ${pedido.status === 'pronto' ? 'selected' : ''}>Pronto</option>
            <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
            <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td>${pedido.paymentMethod}</td>
        <td>${new Date(pedido.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewPedido('${pedido._id}')">
            Ver
          </button>
          ${pedido.status === 'pendente' ? `
            <button class="btn btn-sm btn-danger" onclick="cancelPedido('${pedido._id}')">
              Cancelar
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// Renderizar select de clientes
function renderClienteSelect() {
  if (!elements.clienteSelect) return;
  
  elements.clienteSelect.innerHTML = `
    <option value="">Selecione um cliente</option>
    ${clientes.map(cliente => `
      <option value="${cliente._id}">${cliente.name}</option>
    `).join('')}
  `;
}

// Renderizar select de produtos
function renderProdutoSelect(container = elements.produtosContainer) {
  const produtoItem = document.createElement('div');
  produtoItem.className = 'produto-item mb-3';
  
  produtoItem.innerHTML = `
    <div class="row">
      <div class="col-md-6 mb-2">
        <select class="form-select produto-select" required>
          <option value="">Selecione um produto</option>
          ${produtos.map(produto => `
            <option value="${produto._id}" data-price="${produto.price}">
              ${produto.name} - R$ ${produto.price.toFixed(2)}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="col-md-4 mb-2">
        <input type="number" class="form-control quantidade-input" 
          value="1" min="1" required>
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-danger btn-sm remove-produto">
          Remover
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(produtoItem);
  
  // Evento para remover produto
  produtoItem.querySelector('.remove-produto').addEventListener('click', () => {
    produtoItem.remove();
  });
}

// Salvar pedido
async function savePedido(data) {
  try {
    state.setLoading(true);

    // Validar se há cliente selecionado
    if (!data.client) {
      throw new Error('Selecione um cliente');
    }

    // Validar se há itens no pedido
    if (!data.items || data.items.length === 0) {
      throw new Error('Adicione pelo menos um item ao pedido');
    }

    // Validar se todos os itens têm produto selecionado e quantidade válida
    const itemInvalido = data.items.find(item => !item.product || !item.quantity || item.quantity < 1);
    if (itemInvalido) {
      throw new Error('Todos os itens devem ter um produto selecionado e quantidade maior que zero');
    }

    await api.createPedido(data);
    await loadPedidos();
    
    if (elements.novoPedidoModal) {
      elements.novoPedidoModal.hide();
    }
    elements.novoPedidoForm.reset();
    elements.produtosContainer.innerHTML = '';
    renderProdutoSelect();

    showSuccess('Pedido criado com sucesso');
  } catch (error) {
    showError('Erro ao criar pedido', error);
  } finally {
    state.setLoading(false);
  }
}

// Ver detalhes do pedido
window.viewPedido = async (id) => {
  try {
    state.setLoading(true);
    const pedido = await api.getPedido(id);
    
    Swal.fire({
      title: `Pedido - ${pedido.client.name}`,
      html: `
        <div class="text-start">
          <p><strong>Status:</strong> ${pedido.status}</p>
          <p><strong>Forma de Pagamento:</strong> ${pedido.paymentMethod}</p>
          <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString()}</p>
          ${pedido.observations ? `<p><strong>Observações:</strong> ${pedido.observations}</p>` : ''}
          <hr>
          <h6>Itens:</h6>
          <ul>
            ${pedido.items.map(item => `
              <li>${item.product.name} x${item.quantity} - R$ ${item.price.toFixed(2)}</li>
            `).join('')}
          </ul>
          <hr>
          <h6>Endereço de Entrega:</h6>
          <p>
            ${pedido.client.address.street}, ${pedido.client.address.number}
            ${pedido.client.address.complement ? ` - ${pedido.client.address.complement}` : ''}<br>
            ${pedido.client.address.neighborhood}<br>
            ${pedido.client.address.city} - ${pedido.client.address.state}<br>
            CEP: ${pedido.client.address.zipCode}
          </p>
        </div>
      `,
      width: '600px'
    });
  } catch (error) {
    showError('Erro ao carregar detalhes do pedido', error);
  } finally {
    state.setLoading(false);
  }
};

// Atualizar status do pedido
window.updateStatus = async (id, status) => {
  try {
    state.setLoading(true);
    await api.updatePedidoStatus(id, status);
    await loadPedidos();
    showSuccess('Status atualizado com sucesso');
  } catch (error) {
    showError('Erro ao atualizar status', error);
  } finally {
    state.setLoading(false);
  }
};

// Cancelar pedido
window.cancelPedido = async (id) => {
  try {
    const result = await Swal.fire({
      title: 'Cancelar Pedido',
      text: 'Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar pedido',
      cancelButtonText: 'Não, manter pedido',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      state.setLoading(true);
      await api.cancelPedido(id);
      await loadPedidos();
      showSuccess('Pedido cancelado com sucesso');
    }
  } catch (error) {
    showError('Erro ao cancelar pedido', error);
  } finally {
    state.setLoading(false);
  }
};

// Event Listeners
function setupEventListeners() {
  elements.novoPedidoBtn?.addEventListener('click', loadDependencies);
  
  elements.addProdutoBtn?.addEventListener('click', () => {
    renderProdutoSelect();
  });
  
  elements.novoPedidoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const items = Array.from(document.querySelectorAll('.produto-item')).map(item => {
      const select = item.querySelector('.produto-select');
      const quantidade = item.querySelector('.quantidade-input');
      const option = select.options[select.selectedIndex];
      
      return {
        product: select.value,
        quantity: parseInt(quantidade.value),
        price: parseFloat(option.dataset.price)
      };
    });
    
    const data = {
      client: elements.clienteSelect.value,
      items,
      paymentMethod: elements.paymentMethod.value,
      observations: elements.observations?.value || ''
    };
    
    await savePedido(data);
  });
}

// Inicialização
export function initPedidos() {
  setupEventListeners();
  
  // Carregar dados iniciais
  if (window.location.hash === '#/pedidos') {
    loadPedidos();
    loadDependencies();
  }
  
  // Atualizar quando mudar a rota
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/pedidos') {
      loadPedidos();
      loadDependencies();
    }
  });
}

// Helpers
function showSuccess(message) {
  Swal.fire({
    icon: 'success',
    title: 'Sucesso',
    text: message,
    timer: 1500,
    showConfirmButton: false
  });
}

function showError(title, error) {
  console.error(title, error);
  
  let message = 'Ocorreu um erro. Por favor, tente novamente.';
  
  if (error.message) {
    message = error.message;
  } else if (error.errors) {
    message = Object.values(error.errors).join('\n');
  }
  
  Swal.fire({
    icon: 'error',
    title: title,
    text: message
  });
} 
import { api } from './api.js';

export function initPedidos() {
  const pedidosTableBody = document.getElementById('pedidosTableBody');
  const novoPedidoForm = document.getElementById('novoPedidoForm');
  const novoPedidoModal = new bootstrap.Modal('#novoPedidoModal');
  const clienteSelect = document.getElementById('clienteSelect');
  const produtosContainer = document.querySelector('.produtos-container');
  const addProdutoBtn = document.getElementById('addProdutoBtn');

  let pedidos = [];
  let clientes = [];
  let produtos = [];

  // Carregar pedidos
  async function loadPedidos() {
    try {
      pedidos = await api.getPedidos();
      renderPedidos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar pedidos'
      });
    }
  }

  // Carregar clientes e produtos
  async function loadDependencies() {
    try {
      [clientes, produtos] = await Promise.all([
        api.getClientes(),
        api.getProdutos()
      ]);

      renderClienteSelect();
      renderProdutoSelect();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar dados necessários'
      });
    }
  }

  // Renderizar tabela de pedidos
  function renderPedidos() {
    if (!pedidosTableBody) return;

    pedidosTableBody.innerHTML = pedidos.map(pedido => `
      <tr>
        <td>${pedido.client.name}</td>
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
    `).join('');
  }

  // Renderizar select de clientes
  function renderClienteSelect() {
    if (!clienteSelect) return;

    clienteSelect.innerHTML = `
      <option value="">Selecione um cliente</option>
      ${clientes.map(cliente => `
        <option value="${cliente._id}">${cliente.name}</option>
      `).join('')}
    `;
  }

  // Renderizar select de produtos
  function renderProdutoSelect(container = produtosContainer) {
    if (!container) return;

    const produtoItem = document.createElement('div');
    produtoItem.className = 'produto-item';
    produtoItem.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-2">
          <select class="form-select produto-select" required>
            <option value="">Selecione um produto</option>
            ${produtos.filter(p => p.available).map(produto => `
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
      await api.createPedido(data);
      await loadPedidos();
      novoPedidoModal.hide();
      novoPedidoForm.reset();
      produtosContainer.innerHTML = '';
      renderProdutoSelect();

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Pedido criado com sucesso',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao criar pedido'
      });
    }
  }

  // Ver detalhes do pedido
  window.viewPedido = async (id) => {
    try {
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
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar detalhes do pedido'
      });
    }
  };

  // Atualizar status do pedido
  window.updateStatus = async (id, status) => {
    try {
      await api.updatePedidoStatus(id, status);
      await loadPedidos();

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Status atualizado com sucesso',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao atualizar status'
      });
    }
  };

  // Cancelar pedido
  window.cancelPedido = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Não'
    });

    if (result.isConfirmed) {
      try {
        await api.cancelPedido(id);
        await loadPedidos();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Pedido cancelado com sucesso',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao cancelar pedido'
        });
      }
    }
  };

  // Event Listeners
  addProdutoBtn?.addEventListener('click', () => {
    renderProdutoSelect();
  });

  novoPedidoForm?.addEventListener('submit', async (e) => {
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

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const data = {
      client: clienteSelect.value,
      items,
      total,
      paymentMethod: document.getElementById('paymentMethod').value,
      observations: document.getElementById('observations').value
    };

    await savePedido(data);
  });

  // Carregar dados iniciais
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#pedidos') {
      loadPedidos();
      loadDependencies();
    }
  });

  if (window.location.hash === '#pedidos') {
    loadPedidos();
    loadDependencies();
  }
} 
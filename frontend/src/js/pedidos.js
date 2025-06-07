import { api } from './api.js';

export function initPedidos() {
  const pedidosTableBody = document.getElementById('pedidosTableBody');
  const novoPedidoForm = document.getElementById('novoPedidoForm');
  const novoPedidoModal = new bootstrap.Modal('#novoPedidoModal');
  const novoPedidoModalEl = document.getElementById('novoPedidoModal');
  const clienteSelect = document.getElementById('clienteSelect');
  const produtosContainer = document.querySelector('.produtos-container');
  const addProdutoBtn = document.getElementById('addProdutoBtn');
  const novoPedidoBtn = document.querySelector('[data-bs-target="#novoPedidoModal"]');

  let pedidos = [];
  let clientes = [];
  let produtos = [];

  // Carregar pedidos
  async function loadPedidos() {
    try {
      console.log('Carregando pedidos...');
      pedidos = await api.getPedidos();
      console.log('Pedidos carregados:', pedidos);
      renderPedidos();
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
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
      console.log('Carregando clientes e produtos...');
      const [clientesResponse, produtosResponse] = await Promise.all([
        api.getClientes(),
        api.getProdutos()
      ]);

      clientes = clientesResponse;
      produtos = produtosResponse;

      console.log('Clientes carregados:', clientes);
      console.log('Produtos carregados:', produtos);

      renderClienteSelect();
      renderProdutoSelect();
    } catch (error) {
      console.error('Erro ao carregar dados necessários:', error);
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

    console.log('Renderizando pedidos:', pedidos);

    pedidosTableBody.innerHTML = pedidos.map(pedido => {
      console.log('Renderizando pedido:', pedido);
      
      // Verificar se o cliente existe
      if (!pedido.client) {
        console.warn('Pedido sem cliente:', pedido);
      }

      // Verificar se os itens existem
      if (!pedido.items || !Array.isArray(pedido.items)) {
        console.warn('Pedido sem itens ou itens inválidos:', pedido);
      }

      // Formatar os itens para exibição
      const itensFormatados = pedido.items?.map(item => {
        if (!item.product) {
          console.warn('Item sem produto:', item);
          return 'Produto não encontrado';
        }
        return `${item.product.name} (${item.quantity}x)`;
      }).join(', ') || 'Sem itens';

      // Calcular o total
      const total = pedido.total || pedido.items?.reduce((acc, item) => {
        if (!item.product || !item.quantity) return acc;
        return acc + (item.price * item.quantity);
      }, 0) || 0;

      return `
        <tr>
          <td>${pedido.client?.name || 'Cliente não encontrado'}</td>
          <td>${itensFormatados}</td>
          <td>R$ ${total.toFixed(2)}</td>
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
          <td>${pedido.paymentMethod || 'Não informado'}</td>
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
    if (!clienteSelect) {
      console.warn('Elemento clienteSelect não encontrado');
      return;
    }

    console.log('Renderizando select de clientes:', clientes);
    console.log('Total de clientes:', clientes.length);

    clienteSelect.innerHTML = `
      <option value="">Selecione um cliente</option>
      ${clientes.map(cliente => `
        <option value="${cliente._id}">${cliente.name} - ${cliente.phone}</option>
      `).join('')}
    `;

    console.log('Select de clientes renderizado com', clienteSelect.options.length, 'opções');
  }

  // Renderizar select de produtos
  function renderProdutoSelect(container = produtosContainer) {
    if (!container) {
      console.warn('Container de produtos não encontrado');
      return;
    }

    console.log('Renderizando select de produtos:', produtos);
    console.log('Total de produtos:', produtos.length);
    console.log('Produtos disponíveis:', produtos.filter(p => p.available).length);

    const produtoItem = document.createElement('div');
    produtoItem.className = 'produto-item mb-3';
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
    console.log('Novo item de produto adicionado ao container');

    // Evento para remover produto
    produtoItem.querySelector('.remove-produto').addEventListener('click', () => {
      produtoItem.remove();
      console.log('Item de produto removido');
    });
  }

  // Salvar pedido
  async function savePedido(data) {
    try {
      console.log('Dados recebidos para salvar:', data);

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

      // Preparar os dados para envio
      const pedidoData = {
        client: data.client,
        items: data.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        paymentMethod: data.paymentMethod,
        observations: data.observations || ''
      };

      console.log('Dados formatados para envio:', pedidoData);

      const response = await api.createPedido(pedidoData);
      console.log('Resposta do servidor:', response);

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
      console.error('Erro ao criar pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Erro ao criar pedido'
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
  novoPedidoBtn?.addEventListener('click', async () => {
    await loadDependencies();
  });

  novoPedidoModalEl?.addEventListener('shown.bs.modal', async () => {
    console.log('Modal de novo pedido aberto, carregando dados...');
    await loadDependencies();
    console.log('Dados carregados para o modal de novo pedido');
  });

  addProdutoBtn?.addEventListener('click', () => {
    console.log('Botão de adicionar produto clicado');
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

    const data = {
      client: clienteSelect.value,
      items,
      paymentMethod: document.getElementById('paymentMethod').value,
      observations: document.getElementById('observations')?.value || ''
    };

    await savePedido(data);
  });

  // Carregar dados iniciais
  window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#pedidos') {
      console.log('Iniciando carregamento de dados...');
      loadPedidos();
      loadDependencies();
    }
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#pedidos') {
      console.log('Hash mudou para #pedidos, carregando dados...');
      loadPedidos();
      loadDependencies();
    }
  });
} 
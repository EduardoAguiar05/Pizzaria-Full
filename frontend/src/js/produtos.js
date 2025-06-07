import { api } from './api.js';

export function initProdutos() {
  const produtosTableBody = document.getElementById('produtosTableBody');
  const novoProdutoForm = document.getElementById('novoProdutoForm');
  const novoProdutoModalEl = document.getElementById('novoProdutoModal');
  const novoProdutoModal = new bootstrap.Modal(novoProdutoModalEl);

  let produtos = [];
  let editingId = null;

  // Adicionar evento para limpar o formulário quando o modal for fechado
  novoProdutoModalEl.addEventListener('hidden.bs.modal', () => {
    novoProdutoForm.reset();
    editingId = null;
  });

  // Carregar produtos
  async function loadProdutos() {
    try {
      produtos = await api.getProdutos();
      renderProdutos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar produtos'
      });
    }
  }

  // Renderizar tabela de produtos
  function renderProdutos() {
    if (!produtosTableBody) return;

    produtosTableBody.innerHTML = produtos.map(produto => `
      <tr>
        <td>${produto.name}</td>
        <td>${produto.category}</td>
        <td>R$ ${produto.price.toFixed(2)}</td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" 
              ${produto.available ? 'checked' : ''}
              onchange="toggleDisponibilidade('${produto._id}', this.checked)">
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editProduto('${produto._id}')">
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduto('${produto._id}')">
            Excluir
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Salvar produto
  async function saveProduto(data) {
    try {
      if (editingId) {
        await api.updateProduto(editingId, data);
        editingId = null;
      } else {
        await api.createProduto(data);
      }

      await loadProdutos();
      novoProdutoModal.hide();
      novoProdutoForm.reset();

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: `Produto ${editingId ? 'atualizado' : 'cadastrado'} com sucesso`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Erro ao ${editingId ? 'atualizar' : 'cadastrar'} produto`
      });
    }
  }

  // Editar produto
  window.editProduto = async (id) => {
    try {
      const produto = await api.getProduto(id);
      editingId = id;

      document.getElementById('productName').value = produto.name;
      document.getElementById('productCategory').value = produto.category;
      document.getElementById('productPrice').value = produto.price;
      document.getElementById('productDescription').value = produto.description;
      document.getElementById('productIngredients').value = produto.ingredients?.join(', ') || '';

      novoProdutoModal.show();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar dados do produto'
      });
    }
  };

  // Excluir produto
  window.deleteProduto = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteProduto(id);
        await loadProdutos();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Produto excluído com sucesso',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao excluir produto'
        });
      }
    }
  };

  // Alterar disponibilidade
  window.toggleDisponibilidade = async (id, available) => {
    try {
      await api.updateProdutoDisponibilidade(id, available);
      await loadProdutos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao atualizar disponibilidade'
      });
    }
  };

  // Event Listeners
  novoProdutoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      price: parseFloat(document.getElementById('productPrice').value),
      description: document.getElementById('productDescription').value,
      ingredients: document.getElementById('productIngredients').value
        .split(',')
        .map(i => i.trim())
        .filter(i => i)
    };

    await saveProduto(data);
  });

  // Carregar dados iniciais
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#produtos') {
      loadProdutos();
    }
  });

  if (window.location.hash === '#produtos') {
    loadProdutos();
  }
} 
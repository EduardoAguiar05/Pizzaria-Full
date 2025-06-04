import { api } from './api.js';

export function initClientes() {
  const clientesTableBody = document.getElementById('clientesTableBody');
  const novoClienteForm = document.getElementById('novoClienteForm');
  const novoClienteModal = new bootstrap.Modal('#novoClienteModal');

  let clientes = [];
  let editingId = null;

  // Carregar clientes
  async function loadClientes() {
    try {
      clientes = await api.getClientes();
      renderClientes();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar clientes'
      });
    }
  }

  // Renderizar tabela de clientes
  function renderClientes() {
    if (!clientesTableBody) return;

    clientesTableBody.innerHTML = clientes.map(cliente => `
      <tr>
        <td>${cliente.name}</td>
        <td>${cliente.email}</td>
        <td>${cliente.phone}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editCliente('${cliente._id}')">
            Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteCliente('${cliente._id}')">
            Excluir
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Salvar cliente
  async function saveCliente(data) {
    try {
      if (editingId) {
        await api.updateCliente(editingId, data);
        editingId = null;
      } else {
        await api.createCliente(data);
      }

      await loadClientes();
      novoClienteModal.hide();
      novoClienteForm.reset();

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: `Cliente ${editingId ? 'atualizado' : 'cadastrado'} com sucesso`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Erro ao ${editingId ? 'atualizar' : 'cadastrar'} cliente`
      });
    }
  }

  // Editar cliente
  window.editCliente = async (id) => {
    try {
      const cliente = await api.getCliente(id);
      editingId = id;

      document.getElementById('clientName').value = cliente.name;
      document.getElementById('clientEmail').value = cliente.email;
      document.getElementById('clientPhone').value = cliente.phone;
      document.getElementById('clientStreet').value = cliente.address.street;
      document.getElementById('clientNumber').value = cliente.address.number;
      document.getElementById('clientComplement').value = cliente.address.complement || '';
      document.getElementById('clientNeighborhood').value = cliente.address.neighborhood;
      document.getElementById('clientCity').value = cliente.address.city;
      document.getElementById('clientState').value = cliente.address.state;
      document.getElementById('clientZipCode').value = cliente.address.zipCode;

      novoClienteModal.show();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar dados do cliente'
      });
    }
  };

  // Excluir cliente
  window.deleteCliente = async (id) => {
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
        await api.deleteCliente(id);
        await loadClientes();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Cliente excluído com sucesso',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao excluir cliente'
        });
      }
    }
  };

  // Event Listeners
  novoClienteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('clientName').value,
      email: document.getElementById('clientEmail').value,
      phone: document.getElementById('clientPhone').value,
      address: {
        street: document.getElementById('clientStreet').value,
        number: document.getElementById('clientNumber').value,
        complement: document.getElementById('clientComplement').value,
        neighborhood: document.getElementById('clientNeighborhood').value,
        city: document.getElementById('clientCity').value,
        state: document.getElementById('clientState').value,
        zipCode: document.getElementById('clientZipCode').value
      }
    };

    await saveCliente(data);
  });

  // Carregar dados iniciais
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#clientes') {
      loadClientes();
    }
  });

  if (window.location.hash === '#clientes') {
    loadClientes();
  }
} 
// Função para listar clientes
async function listClients() {
    try {
        const response = await api.get('/clients');
        return response.data;
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        throw error;
    }
}

// Função para criar cliente
async function createClient(clientData) {
    try {
        const response = await api.post('/clients', clientData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
    }
}

// Função para atualizar cliente
async function updateClient(id, clientData) {
    try {
        const response = await api.put(`/clients/${id}`, clientData);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        throw error;
    }
}

// Função para deletar cliente
async function deleteClient(id) {
    try {
        await api.delete(`/clients/${id}`);
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        throw error;
    }
}

// Função para renderizar a lista de clientes
async function renderClients() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        const clients = await listClients();
        
        mainContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Clientes</h2>
                <button class="btn btn-primary" onclick="showClientModal()">Novo Cliente</button>
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Endereço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(client => `
                            <tr>
                                <td>${client.name}</td>
                                <td>${client.phone}</td>
                                <td>
                                    ${client.address.street}, ${client.address.number}
                                    ${client.address.complement ? ` - ${client.address.complement}` : ''}
                                    <br>
                                    ${client.address.neighborhood}, ${client.address.city} - ${client.address.state}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="showClientModal('${client._id}')">
                                        Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteClient('${client._id}')">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar clientes. Por favor, tente novamente.
            </div>
        `;
    }
}

// Função para mostrar o modal de cliente
async function showClientModal(clientId = null) {
    const modal = new bootstrap.Modal(document.getElementById('mainModal'));
    const modalTitle = document.querySelector('#mainModal .modal-title');
    const modalBody = document.querySelector('#mainModal .modal-body');
    const modalSaveBtn = document.getElementById('modalSaveBtn');

    let client = null;
    if (clientId) {
        try {
            const response = await api.get(`/clients/${clientId}`);
            client = response.data;
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            return;
        }
    }

    modalTitle.textContent = client ? 'Editar Cliente' : 'Novo Cliente';
    modalBody.innerHTML = `
        <form id="clientForm">
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" class="form-control" id="name" required value="${client?.name || ''}">
            </div>
            <div class="form-group">
                <label for="phone">Telefone</label>
                <input type="tel" class="form-control" id="phone" required value="${client?.phone || ''}">
            </div>
            <div class="form-group">
                <label for="street">Rua</label>
                <input type="text" class="form-control" id="street" required value="${client?.address?.street || ''}">
            </div>
            <div class="form-group">
                <label for="number">Número</label>
                <input type="text" class="form-control" id="number" required value="${client?.address?.number || ''}">
            </div>
            <div class="form-group">
                <label for="complement">Complemento</label>
                <input type="text" class="form-control" id="complement" value="${client?.address?.complement || ''}">
            </div>
            <div class="form-group">
                <label for="neighborhood">Bairro</label>
                <input type="text" class="form-control" id="neighborhood" required value="${client?.address?.neighborhood || ''}">
            </div>
            <div class="form-group">
                <label for="city">Cidade</label>
                <input type="text" class="form-control" id="city" required value="${client?.address?.city || ''}">
            </div>
            <div class="form-group">
                <label for="state">Estado</label>
                <input type="text" class="form-control" id="state" required value="${client?.address?.state || ''}">
            </div>
        </form>
    `;

    modalSaveBtn.onclick = async () => {
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            address: {
                street: document.getElementById('street').value,
                number: document.getElementById('number').value,
                complement: document.getElementById('complement').value,
                neighborhood: document.getElementById('neighborhood').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value
            }
        };

        try {
            if (client) {
                await updateClient(client._id, formData);
            } else {
                await createClient(formData);
            }
            modal.hide();
            renderClients();
        } catch (error) {
            alert('Erro ao salvar cliente. Por favor, tente novamente.');
        }
    };

    modal.show();
}

// Função para confirmar exclusão de cliente
function confirmDeleteClient(clientId) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        deleteClient(clientId)
            .then(() => renderClients())
            .catch(() => alert('Erro ao deletar cliente. Por favor, tente novamente.'));
    }
} 
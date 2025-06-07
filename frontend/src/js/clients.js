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
        const response = await api.axios.post('/clients', clientData);
        await Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Cliente cadastrado com sucesso',
            timer: 1500,
            showConfirmButton: false
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        let errorMessage = 'Erro ao cadastrar cliente. Por favor, tente novamente.';
        
        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        await Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: errorMessage
        });
        throw error;
    }
}

// Função para atualizar cliente
async function updateClient(id, clientData) {
    try {
        const response = await api.axios.put(`/clients/${id}`, clientData);
        await Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Cliente atualizado com sucesso',
            timer: 1500,
            showConfirmButton: false
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        let errorMessage = 'Erro ao atualizar cliente. Por favor, tente novamente.';
        
        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        await Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: errorMessage
        });
        throw error;
    }
}

// Função para deletar cliente
async function deleteClient(id) {
    try {
        await api.axios.delete(`/clients/${id}`);
        await Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Cliente excluído com sucesso',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        let errorMessage = 'Erro ao excluir cliente. Por favor, tente novamente.';
        
        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        await Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: errorMessage
        });
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

// Função para aplicar máscara de telefone
function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length >= 11) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    input.value = value;
}

// Função para aplicar máscara de CEP
function maskZipCode(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length === 8) {
        value = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }
    input.value = value;
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
            const response = await api.axios.get(`/clients/${clientId}`);
            client = response.data;
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            return;
        }
    }

    modalTitle.textContent = client ? 'Editar Cliente' : 'Novo Cliente';
    modalBody.innerHTML = `
        <form id="clientForm">
            <div class="form-group mb-3">
                <label for="name">Nome</label>
                <input type="text" class="form-control" id="name" required value="${client?.name || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" value="${client?.email || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="phone">Telefone</label>
                <input type="tel" class="form-control" id="phone" required value="${client?.phone || ''}" 
                       oninput="maskPhone(this)" placeholder="(99) 99999-9999">
            </div>
            <div class="form-group mb-3">
                <label for="street">Rua</label>
                <input type="text" class="form-control" id="street" required value="${client?.address?.street || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="number">Número</label>
                <input type="text" class="form-control" id="number" required value="${client?.address?.number || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="complement">Complemento</label>
                <input type="text" class="form-control" id="complement" value="${client?.address?.complement || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="neighborhood">Bairro</label>
                <input type="text" class="form-control" id="neighborhood" required value="${client?.address?.neighborhood || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="city">Cidade</label>
                <input type="text" class="form-control" id="city" required value="${client?.address?.city || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="state">Estado</label>
                <input type="text" class="form-control" id="state" required value="${client?.address?.state || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="zipCode">CEP</label>
                <input type="text" class="form-control" id="zipCode" required value="${client?.address?.zipCode || ''}"
                       oninput="maskZipCode(this)" placeholder="12345-678">
            </div>
        </form>
    `;

    modalSaveBtn.onclick = async () => {
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim() || undefined,
            phone: document.getElementById('phone').value.trim(),
            address: {
                street: document.getElementById('street').value.trim(),
                number: document.getElementById('number').value.trim(),
                complement: document.getElementById('complement').value.trim() || undefined,
                neighborhood: document.getElementById('neighborhood').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipCode: document.getElementById('zipCode').value.trim()
            }
        };

        console.log('Dados do formulário:', formData);

        // Validação básica
        if (!formData.name || !formData.phone) {
            await Swal.fire({
                icon: 'error',
                title: 'Campos obrigatórios',
                text: 'Nome e telefone são obrigatórios'
            });
            return;
        }

        // Validação do telefone
        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone)) {
            await Swal.fire({
                icon: 'error',
                title: 'Formato inválido',
                text: 'O telefone deve estar no formato (99) 99999-9999'
            });
            return;
        }

        // Validação do CEP
        if (!/^\d{5}-\d{3}$/.test(formData.address.zipCode)) {
            await Swal.fire({
                icon: 'error',
                title: 'Formato inválido',
                text: 'O CEP deve estar no formato 12345-678'
            });
            return;
        }

        // Validação do endereço
        const requiredAddressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
        const missingFields = requiredAddressFields.filter(field => !formData.address[field]);

        if (missingFields.length > 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Campos obrigatórios',
                text: `Os seguintes campos do endereço são obrigatórios: ${missingFields.join(', ')}`
            });
            return;
        }

        try {
            if (client) {
                await updateClient(client._id, formData);
            } else {
                await createClient(formData);
            }
            modal.hide();
            await renderClients();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            // O tratamento de erro específico agora está no interceptor
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
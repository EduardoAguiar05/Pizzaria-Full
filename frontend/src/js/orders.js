// Função para listar pedidos
async function listOrders() {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        throw error;
    }
}

// Função para criar pedido
async function createOrder(orderData) {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
}

// Função para atualizar status do pedido
async function updateOrderStatus(id, status) {
    try {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        throw error;
    }
}

// Função para deletar pedido
async function deleteOrder(id) {
    try {
        await api.delete(`/orders/${id}`);
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        throw error;
    }
}

// Função para renderizar a lista de pedidos
async function renderOrders() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        const orders = await listOrders();
        const [clients, products] = await Promise.all([
            api.get('/clients').then(res => res.data),
            api.get('/products').then(res => res.data)
        ]);
        
        mainContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Pedidos</h2>
                <button class="btn btn-primary" onclick="showOrderModal()">Novo Pedido</button>
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Itens</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Pagamento</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.client.name}</td>
                                <td>
                                    ${order.items.map(item => `
                                        ${item.product.name} (${item.quantity}x)
                                    `).join('<br>')}
                                </td>
                                <td>R$ ${order.total.toFixed(2)}</td>
                                <td>
                                    <select class="form-select form-select-sm" 
                                            onchange="updateOrderStatus('${order._id}', this.value)">
                                        <option value="pendente" ${order.status === 'pendente' ? 'selected' : ''}>
                                            Pendente
                                        </option>
                                        <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>
                                            Preparando
                                        </option>
                                        <option value="saiu_para_entrega" ${order.status === 'saiu_para_entrega' ? 'selected' : ''}>
                                            Saiu para Entrega
                                        </option>
                                        <option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>
                                            Entregue
                                        </option>
                                        <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>
                                            Cancelado
                                        </option>
                                    </select>
                                </td>
                                <td>${order.paymentMethod}</td>
                                <td>${new Date(order.createdAt).toLocaleString()}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteOrder('${order._id}')">
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
                Erro ao carregar pedidos. Por favor, tente novamente.
            </div>
        `;
    }
}

// Função para mostrar o modal de pedido
async function showOrderModal(orderId = null) {
    const modal = new bootstrap.Modal(document.getElementById('mainModal'));
    const modalTitle = document.querySelector('#mainModal .modal-title');
    const modalBody = document.querySelector('#mainModal .modal-body');
    const modalSaveBtn = document.getElementById('modalSaveBtn');

    try {
        const [clients, products] = await Promise.all([
            api.get('/clients').then(res => res.data),
            api.get('/products').then(res => res.data)
        ]);

        let order = null;
        if (orderId) {
            const response = await api.get(`/orders/${orderId}`);
            order = response.data;
        }

        modalTitle.textContent = order ? 'Editar Pedido' : 'Novo Pedido';
        modalBody.innerHTML = `
            <form id="orderForm">
                <div class="form-group">
                    <label for="client">Cliente</label>
                    <select class="form-control" id="client" required>
                        <option value="">Selecione um cliente</option>
                        ${clients.map(client => `
                            <option value="${client._id}" ${order?.client._id === client._id ? 'selected' : ''}>
                                ${client.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Itens</label>
                    <div id="orderItems">
                        <div class="row mb-2">
                            <div class="col-6">
                                <select class="form-control" name="product">
                                    <option value="">Selecione um produto</option>
                                    ${products.map(product => `
                                        <option value="${product._id}" data-price="${product.price}">
                                            ${product.name} - R$ ${product.price.toFixed(2)}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-4">
                                <input type="number" class="form-control" name="quantity" min="1" value="1">
                            </div>
                            <div class="col-2">
                                <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(this)">
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm mt-2" onclick="addOrderItem()">
                        Adicionar Item
                    </button>
                </div>

                <div class="form-group">
                    <label for="paymentMethod">Forma de Pagamento</label>
                    <select class="form-control" id="paymentMethod" required>
                        <option value="dinheiro" ${order?.paymentMethod === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
                        <option value="cartao_credito" ${order?.paymentMethod === 'cartao_credito' ? 'selected' : ''}>Cartão de Crédito</option>
                        <option value="cartao_debito" ${order?.paymentMethod === 'cartao_debito' ? 'selected' : ''}>Cartão de Débito</option>
                        <option value="pix" ${order?.paymentMethod === 'pix' ? 'selected' : ''}>PIX</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="observations">Observações</label>
                    <textarea class="form-control" id="observations">${order?.observations || ''}</textarea>
                </div>
            </form>
        `;

        if (order) {
            const itemsContainer = document.getElementById('orderItems');
            itemsContainer.innerHTML = '';
            order.items.forEach(item => {
                itemsContainer.innerHTML += `
                    <div class="row mb-2">
                        <div class="col-6">
                            <select class="form-control" name="product">
                                <option value="">Selecione um produto</option>
                                ${products.map(product => `
                                    <option value="${product._id}" 
                                            data-price="${product.price}"
                                            ${item.product._id === product._id ? 'selected' : ''}>
                                        ${product.name} - R$ ${product.price.toFixed(2)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="col-4">
                            <input type="number" class="form-control" name="quantity" min="1" value="${item.quantity}">
                        </div>
                        <div class="col-2">
                            <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(this)">
                                Remover
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        modalSaveBtn.onclick = async () => {
            const items = [];
            const itemRows = document.querySelectorAll('#orderItems .row');
            
            itemRows.forEach(row => {
                const productSelect = row.querySelector('[name="product"]');
                const quantityInput = row.querySelector('[name="quantity"]');
                const price = parseFloat(productSelect.selectedOptions[0].dataset.price);
                
                items.push({
                    product: productSelect.value,
                    quantity: parseInt(quantityInput.value),
                    price: price
                });
            });

            const formData = {
                client: document.getElementById('client').value,
                items,
                paymentMethod: document.getElementById('paymentMethod').value,
                observations: document.getElementById('observations').value
            };

            try {
                if (order) {
                    await updateOrder(order._id, formData);
                } else {
                    await createOrder(formData);
                }
                modal.hide();
                renderOrders();
            } catch (error) {
                alert('Erro ao salvar pedido. Por favor, tente novamente.');
            }
        };

        modal.show();
    } catch (error) {
        console.error('Erro ao carregar dados para o modal:', error);
        alert('Erro ao carregar dados. Por favor, tente novamente.');
    }
}

// Função para adicionar item ao pedido
function addOrderItem() {
    const itemsContainer = document.getElementById('orderItems');
    const products = Array.from(itemsContainer.querySelector('select[name="product"]').options)
        .map(option => ({
            value: option.value,
            text: option.text,
            price: option.dataset.price
        }));

    const newItem = document.createElement('div');
    newItem.className = 'row mb-2';
    newItem.innerHTML = `
        <div class="col-6">
            <select class="form-control" name="product">
                <option value="">Selecione um produto</option>
                ${products.map(product => `
                    <option value="${product.value}" data-price="${product.price}">
                        ${product.text}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="col-4">
            <input type="number" class="form-control" name="quantity" min="1" value="1">
        </div>
        <div class="col-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(this)">
                Remover
            </button>
        </div>
    `;

    itemsContainer.appendChild(newItem);
}

// Função para remover item do pedido
function removeOrderItem(button) {
    const row = button.closest('.row');
    if (document.querySelectorAll('#orderItems .row').length > 1) {
        row.remove();
    }
}

// Função para confirmar exclusão de pedido
function confirmDeleteOrder(orderId) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        deleteOrder(orderId)
            .then(() => renderOrders())
            .catch(() => alert('Erro ao deletar pedido. Por favor, tente novamente.'));
    }
} 
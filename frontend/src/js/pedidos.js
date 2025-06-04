// Função para renderizar a lista de pedidos
async function renderPedidos() {
    if (!isAuthenticated()) {
        window.location.href = '/#login';
        return;
    }

    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loading"></div>';

    try {
        const pedidos = await api.getPedidos();
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Pedidos</h2>
                <button class="btn btn-primary" onclick="showPedidoForm()">
                    Novo Pedido
                </button>
            </div>
            <div class="row">
        `;

        pedidos.forEach(pedido => {
            const data = new Date(pedido.createdAt).toLocaleString();
            
            html += `
                <div class="col-md-6 mb-4">
                    <div class="card pedido-card ${pedido.status}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="card-title">Pedido #${pedido._id.slice(-6)}</h5>
                                <span class="badge bg-primary">${pedido.status}</span>
                            </div>
                            <p class="card-text">
                                <strong>Cliente:</strong> ${pedido.cliente.nome}<br>
                                <strong>Telefone:</strong> ${pedido.cliente.telefone}<br>
                                <strong>Data:</strong> ${data}<br>
                                <strong>Valor Total:</strong> R$ ${pedido.valorTotal.toFixed(2)}<br>
                                <strong>Forma de Pagamento:</strong> ${pedido.formaPagamento}
                            </p>
                            <h6>Itens do Pedido:</h6>
                            <ul class="list-unstyled">
                                ${pedido.itens.map(item => `
                                    <li>
                                        ${item.quantidade}x ${item.produto.nome} - R$ ${(item.produto.preco * item.quantidade).toFixed(2)}
                                        ${item.observacoes ? `<br><small>${item.observacoes}</small>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                            ${pedido.observacoes ? `
                                <p class="card-text">
                                    <strong>Observações:</strong><br>
                                    ${pedido.observacoes}
                                </p>
                            ` : ''}
                            <div class="btn-group w-100">
                                <button class="btn btn-primary" onclick="showPedidoForm(${JSON.stringify(pedido)})">
                                    Editar
                                </button>
                                <button class="btn btn-danger" onclick="deletarPedido('${pedido._id}')">
                                    Excluir
                                </button>
                            </div>
                            <div class="btn-group w-100 mt-2">
                                ${['pendente', 'preparando', 'saiu_para_entrega', 'entregue'].map(status => `
                                    ${status !== pedido.status ? `
                                        <button class="btn btn-outline-primary" onclick="atualizarStatusPedido('${pedido._id}', '${status}')">
                                            ${status.replace(/_/g, ' ').toUpperCase()}
                                        </button>
                                    ` : ''}
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        mainContent.innerHTML = html;
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        mainContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar pedidos</div>';
    }
}

// Função para mostrar o formulário de pedido (criar/editar)
async function showPedidoForm(pedido = null) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loading"></div>';

    try {
        const [clientes, produtos] = await Promise.all([
            api.getClientes(),
            api.getProdutos()
        ]);

        mainContent.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h2 class="card-title text-center mb-4">
                                ${pedido ? 'Editar' : 'Novo'} Pedido
                            </h2>
                            <form id="pedidoForm">
                                <div class="form-group">
                                    <label for="cliente">Cliente</label>
                                    <select class="form-control" id="cliente" required>
                                        <option value="">Selecione um cliente</option>
                                        ${clientes.map(c => `
                                            <option value="${c._id}" ${pedido?.cliente._id === c._id ? 'selected' : ''}>
                                                ${c.nome} - ${c.telefone}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div id="itensPedido">
                                    <h4 class="mt-4">Itens do Pedido</h4>
                                    ${pedido?.itens.map((item, index) => `
                                        <div class="card mb-3 item-pedido">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="form-group">
                                                            <label>Produto</label>
                                                            <select class="form-control produto" required>
                                                                <option value="">Selecione um produto</option>
                                                                ${produtos.map(p => `
                                                                    <option value="${p._id}" 
                                                                        data-preco="${p.preco}"
                                                                        ${item.produto._id === p._id ? 'selected' : ''}>
                                                                        ${p.nome} - R$ ${p.preco.toFixed(2)}
                                                                    </option>
                                                                `).join('')}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="form-group">
                                                            <label>Quantidade</label>
                                                            <input type="number" class="form-control quantidade" 
                                                                min="1" required value="${item.quantidade}">
                                                        </div>
                                                    </div>
                                                    <div class="col-md-2">
                                                        <button type="button" class="btn btn-danger mt-4" 
                                                            onclick="this.closest('.item-pedido').remove(); calcularTotal()">
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="form-group mt-2">
                                                    <label>Observações</label>
                                                    <textarea class="form-control observacoes">${item.observacoes || ''}</textarea>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('') || ''}
                                </div>
                                <button type="button" class="btn btn-secondary w-100 mb-3" onclick="adicionarItem()">
                                    Adicionar Item
                                </button>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="formaPagamento">Forma de Pagamento</label>
                                            <select class="form-control" id="formaPagamento" required>
                                                <option value="dinheiro" ${pedido?.formaPagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
                                                <option value="cartao_credito" ${pedido?.formaPagamento === 'cartao_credito' ? 'selected' : ''}>Cartão de Crédito</option>
                                                <option value="cartao_debito" ${pedido?.formaPagamento === 'cartao_debito' ? 'selected' : ''}>Cartão de Débito</option>
                                                <option value="pix" ${pedido?.formaPagamento === 'pix' ? 'selected' : ''}>PIX</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="valorTotal">Valor Total</label>
                                            <input type="number" class="form-control" id="valorTotal" readonly>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="observacoes">Observações do Pedido</label>
                                    <textarea class="form-control" id="observacoes">${pedido?.observacoes || ''}</textarea>
                                </div>
                                <div class="d-flex justify-content-between mt-4">
                                    <button type="button" class="btn btn-secondary" onclick="renderPedidos()">Cancelar</button>
                                    <button type="submit" class="btn btn-primary">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Se não houver itens, adiciona um item vazio
        if (!pedido || !pedido.itens.length) {
            adicionarItem();
        }

        // Adicionar evento de submit ao formulário
        document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const itens = Array.from(document.querySelectorAll('.item-pedido')).map(item => ({
                produto: item.querySelector('.produto').value,
                quantidade: parseInt(item.querySelector('.quantidade').value),
                observacoes: item.querySelector('.observacoes').value
            }));

            const pedidoData = {
                cliente: document.getElementById('cliente').value,
                itens,
                formaPagamento: document.getElementById('formaPagamento').value,
                valorTotal: parseFloat(document.getElementById('valorTotal').value),
                observacoes: document.getElementById('observacoes').value
            };

            try {
                if (pedido) {
                    await api.atualizarPedido(pedido._id, pedidoData);
                } else {
                    await api.criarPedido(pedidoData);
                }
                renderPedidos();
            } catch (err) {
                console.error('Erro ao salvar pedido:', err);
                alert('Erro ao salvar pedido');
            }
        });

        // Adicionar eventos para calcular o total
        document.querySelectorAll('.produto, .quantidade').forEach(el => {
            el.addEventListener('change', calcularTotal);
        });

        calcularTotal();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        mainContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados</div>';
    }
}

// Função para adicionar um novo item ao pedido
async function adicionarItem() {
    try {
        const produtos = await api.getProdutos();
        const itemHtml = `
            <div class="card mb-3 item-pedido">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Produto</label>
                                <select class="form-control produto" required>
                                    <option value="">Selecione um produto</option>
                                    ${produtos.map(p => `
                                        <option value="${p._id}" data-preco="${p.preco}">
                                            ${p.nome} - R$ ${p.preco.toFixed(2)}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Quantidade</label>
                                <input type="number" class="form-control quantidade" min="1" required value="1">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-danger mt-4" 
                                onclick="this.closest('.item-pedido').remove(); calcularTotal()">
                                Remover
                            </button>
                        </div>
                    </div>
                    <div class="form-group mt-2">
                        <label>Observações</label>
                        <textarea class="form-control observacoes"></textarea>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('itensPedido').insertAdjacentHTML('beforeend', itemHtml);
        
        // Adicionar eventos para calcular o total
        const novoItem = document.querySelector('.item-pedido:last-child');
        novoItem.querySelectorAll('.produto, .quantidade').forEach(el => {
            el.addEventListener('change', calcularTotal);
        });
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        alert('Erro ao adicionar item');
    }
}

// Função para calcular o total do pedido
function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.item-pedido').forEach(item => {
        const select = item.querySelector('.produto');
        const quantidade = parseInt(item.querySelector('.quantidade').value) || 0;
        if (select.value) {
            const preco = parseFloat(select.options[select.selectedIndex].dataset.preco);
            total += preco * quantidade;
        }
    });
    document.getElementById('valorTotal').value = total.toFixed(2);
}

// Função para atualizar o status de um pedido
async function atualizarStatusPedido(id, status) {
    try {
        await api.atualizarStatusPedido(id, status);
        renderPedidos();
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar status do pedido');
    }
}

// Função para deletar um pedido
async function deletarPedido(id) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) {
        return;
    }

    try {
        await api.deletarPedido(id);
        renderPedidos();
    } catch (err) {
        console.error('Erro ao deletar pedido:', err);
        alert('Erro ao deletar pedido');
    }
} 
// Função para listar produtos
async function listProducts() {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        throw error;
    }
}

// Função para criar produto
async function createProduct(productData) {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
    }
}

// Função para atualizar produto
async function updateProduct(id, productData) {
    try {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
}

// Função para deletar produto
async function deleteProduct(id) {
    try {
        await api.delete(`/products/${id}`);
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
}

// Função para renderizar a lista de produtos
async function renderProducts() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        const products = await listProducts();
        
        mainContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Produtos</h2>
                <button class="btn btn-primary" onclick="showProductModal()">Novo Produto</button>
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Disponível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>R$ ${product.price.toFixed(2)}</td>
                                <td>
                                    <span class="badge ${product.available ? 'bg-success' : 'bg-danger'}">
                                        ${product.available ? 'Sim' : 'Não'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="showProductModal('${product._id}')">
                                        Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteProduct('${product._id}')">
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
                Erro ao carregar produtos. Por favor, tente novamente.
            </div>
        `;
    }
}

// Função para mostrar o modal de produto
async function showProductModal(productId = null) {
    const modal = new bootstrap.Modal(document.getElementById('mainModal'));
    const modalTitle = document.querySelector('#mainModal .modal-title');
    const modalBody = document.querySelector('#mainModal .modal-body');
    const modalSaveBtn = document.getElementById('modalSaveBtn');

    let product = null;
    if (productId) {
        try {
            const response = await api.get(`/products/${productId}`);
            product = response.data;
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            return;
        }
    }

    modalTitle.textContent = product ? 'Editar Produto' : 'Novo Produto';
    modalBody.innerHTML = `
        <form id="productForm">
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" class="form-control" id="name" required value="${product?.name || ''}">
            </div>
            <div class="form-group">
                <label for="description">Descrição</label>
                <textarea class="form-control" id="description" required>${product?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="price">Preço</label>
                <input type="number" step="0.01" class="form-control" id="price" required value="${product?.price || ''}">
            </div>
            <div class="form-group">
                <label for="category">Categoria</label>
                <select class="form-control" id="category" required>
                    <option value="pizza" ${product?.category === 'pizza' ? 'selected' : ''}>Pizza</option>
                    <option value="bebida" ${product?.category === 'bebida' ? 'selected' : ''}>Bebida</option>
                    <option value="sobremesa" ${product?.category === 'sobremesa' ? 'selected' : ''}>Sobremesa</option>
                </select>
            </div>
            <div class="form-group">
                <label for="ingredients">Ingredientes (separados por vírgula)</label>
                <input type="text" class="form-control" id="ingredients" value="${product?.ingredients?.join(', ') || ''}">
            </div>
            <div class="form-group">
                <label for="image">URL da Imagem</label>
                <input type="url" class="form-control" id="image" value="${product?.image || ''}">
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="available" ${product?.available ? 'checked' : ''}>
                <label class="form-check-label" for="available">Disponível</label>
            </div>
        </form>
    `;

    modalSaveBtn.onclick = async () => {
        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            category: document.getElementById('category').value,
            ingredients: document.getElementById('ingredients').value.split(',').map(i => i.trim()).filter(i => i),
            image: document.getElementById('image').value,
            available: document.getElementById('available').checked
        };

        try {
            if (product) {
                await updateProduct(product._id, formData);
            } else {
                await createProduct(formData);
            }
            modal.hide();
            renderProducts();
        } catch (error) {
            alert('Erro ao salvar produto. Por favor, tente novamente.');
        }
    };

    modal.show();
}

// Função para confirmar exclusão de produto
function confirmDeleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        deleteProduct(productId)
            .then(() => renderProducts())
            .catch(() => alert('Erro ao deletar produto. Por favor, tente novamente.'));
    }
} 
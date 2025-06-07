class Api {
  constructor() {
    this.axios = window.axios.create();
  }

  setBaseURL(url) {
    this.axios.defaults.baseURL = url;
  }

  setRequestInterceptor(onFulfilled, onRejected) {
    this.axios.interceptors.request.use(onFulfilled, onRejected);
  }

  setResponseInterceptor(onFulfilled, onRejected) {
    this.axios.interceptors.response.use(onFulfilled, onRejected);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  // Auth
  async login(email, password) {
    const response = await this.axios.post('/auth/login', { email, password });
    return response.data;
  }

  // Clientes
  async getClientes() {
    try {
      console.log('Buscando clientes da API...');
      const response = await this.axios.get('/clients');
      console.log('Resposta da API (clientes):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getCliente(id) {
    const response = await this.axios.get(`/clients/${id}`);
    return response.data;
  }

  async createCliente(data) {
    const response = await this.axios.post('/clients', data);
    return response.data;
  }

  async updateCliente(id, data) {
    const response = await this.axios.put(`/clients/${id}`, data);
    return response.data;
  }

  async deleteCliente(id) {
    const response = await this.axios.delete(`/clients/${id}`);
    return response.data;
  }

  // Produtos
  async getProdutos() {
    try {
      console.log('Buscando produtos da API...');
      const response = await this.axios.get('/products');
      console.log('Resposta da API (produtos):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async getProduto(id) {
    const response = await this.axios.get(`/products/${id}`);
    return response.data;
  }

  async createProduto(data) {
    const response = await this.axios.post('/products', data);
    return response.data;
  }

  async updateProduto(id, data) {
    const response = await this.axios.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduto(id) {
    const response = await this.axios.delete(`/products/${id}`);
    return response.data;
  }

  async updateProdutoDisponibilidade(id, available) {
    const response = await this.axios.patch(`/products/${id}/availability`, { available });
    return response.data;
  }

  // Pedidos
  async getPedidos() {
    try {
      console.log('Buscando pedidos da API...');
      const response = await this.axios.get('/orders');
      console.log('Resposta da API (pedidos):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  }

  async getPedido(id) {
    try {
      console.log(`Buscando pedido ${id} da API...`);
      const response = await this.axios.get(`/orders/${id}`);
      console.log('Resposta da API (pedido):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  async createPedido(data) {
    try {
      console.log('Enviando pedido para API:', data);
      const response = await this.axios.post('/orders', data);
      console.log('Resposta da API (criar pedido):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  async updatePedidoStatus(id, status) {
    try {
      console.log(`Atualizando status do pedido ${id} para ${status}...`);
      const response = await this.axios.patch(`/orders/${id}/status`, { status });
      console.log('Resposta da API (atualizar status):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  async cancelPedido(id) {
    const response = await this.axios.patch(`/orders/${id}/cancel`);
    return response.data;
  }
}

export const api = new Api(); 
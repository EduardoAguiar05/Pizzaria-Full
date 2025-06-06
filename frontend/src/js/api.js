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
    const response = await this.axios.get('/clients');
    return response.data;
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
    const response = await this.axios.get('/products');
    return response.data;
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
    const response = await this.axios.get('/orders');
    return response.data;
  }

  async getPedido(id) {
    const response = await this.axios.get(`/orders/${id}`);
    return response.data;
  }

  async createPedido(data) {
    const response = await this.axios.post('/orders', data);
    return response.data;
  }

  async updatePedidoStatus(id, status) {
    const response = await this.axios.patch(`/orders/${id}/status`, { status });
    return response.data;
  }

  async cancelPedido(id) {
    const response = await this.axios.patch(`/orders/${id}/cancel`);
    return response.data;
  }
}

export const api = new Api(); 
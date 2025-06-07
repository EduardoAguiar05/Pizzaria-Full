class Api {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });

    // Interceptor para adicionar token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Erro no interceptor de request:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para tratamento de erros
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erro na requisição:', error);

        // Erro de autenticação
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.hash = '#/login';
          return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
        }

        // Erro de servidor
        if (error.response?.status === 500) {
          return Promise.reject(new Error('Erro no servidor. Por favor, tente novamente mais tarde.'));
        }

        // Erro de conexão
        if (!error.response) {
          return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos de configuração
  setBaseURL(url) {
    this.baseURL = url;
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

  removeToken() {
    localStorage.removeItem('token');
  }

  // Auth
  async login(email, password) {
    try {
      const response = await this.axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async logout() {
    localStorage.removeItem('token');
    window.location.hash = '#/login';
  }

  // Clientes
  async getClientes() {
    try {
      const response = await this.axios.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async createCliente(data) {
    try {
      const response = await this.axios.post('/clients', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async updateCliente(id, data) {
    try {
      const response = await this.axios.put(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async deleteCliente(id) {
    try {
      const response = await this.axios.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  // Produtos
  async getProdutos() {
    try {
      const response = await this.axios.get('/products');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async createProduto(data) {
    try {
      const response = await this.axios.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  async updateProduto(id, data) {
    try {
      const response = await this.axios.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduto(id) {
    try {
      const response = await this.axios.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  async updateProdutoDisponibilidade(id, available) {
    try {
      const response = await this.axios.patch(`/products/${id}/availability`, { available });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      throw error;
    }
  }

  // Pedidos
  async getPedidos() {
    try {
      const response = await this.axios.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  }

  async getPedido(id) {
    try {
      const response = await this.axios.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  async createPedido(data) {
    try {
      const response = await this.axios.post('/orders', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  async updatePedidoStatus(id, status) {
    try {
      const response = await this.axios.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  async cancelPedido(id) {
    try {
      const response = await this.axios.patch(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw error;
    }
  }
}

export const api = new Api(); 
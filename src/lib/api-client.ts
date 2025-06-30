interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

interface RequestConfig extends RequestInit {
  useAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth-token', token);
      } else {
        localStorage.removeItem('auth-token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { useAuth = true, ...requestConfig } = config;
    
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestConfig.headers as Record<string, string>),
    };

    // Add auth token if available and useAuth is true
    if (useAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...requestConfig,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      useAuth: false,
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      useAuth: false,
    });

    // Store token after successful login
    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Profile endpoints
  async getProfiles() {
    return this.request('/profiles');
  }

  async createProfile(profileData: any) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getProfile(id: string) {
    return this.request(`/profiles/${id}`);
  }

  async updateProfile(id: string, profileData: any) {
    return this.request(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile(id: string) {
    return this.request(`/profiles/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat endpoints
  async sendMessage(profileId: string, message: string, conversationId?: string) {
    return this.request(`/chat/${profileId}`, {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getConversations(profileId?: string) {
    const query = profileId ? `?profileId=${profileId}` : '';
    return this.request(`/conversations${query}`);
  }

  async getConversation(id: string) {
    return this.request(`/conversations/${id}`);
  }

  async deleteConversation(id: string) {
    return this.request(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Test endpoint
  async testBackend() {
    return this.request('/test', { useAuth: false });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
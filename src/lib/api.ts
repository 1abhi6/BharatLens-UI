import axios, { AxiosInstance } from 'axios';
import { LoginResponse, User, ChatSession, Message, CreateSessionRequest, CreateMessageRequest } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string, full_name: string): Promise<User> {
    const response = await this.client.post<User>('/auth/register', {
      email,
      password,
      full_name,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Chat session endpoints
  async createSession(data?: CreateSessionRequest): Promise<ChatSession> {
    const response = await this.client.post<ChatSession>('/api/v1/chat/sessions', data || {});
    return response.data;
  }

  async getSessions(): Promise<ChatSession[]> {
    const response = await this.client.get<ChatSession[]>('/api/v1/chat/sessions');
    return response.data;
  }

  async getSessionMessages(sessionId: string, skip = 0, limit = 20): Promise<Message[]> {
    const response = await this.client.get<Message[]>(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      { params: { skip, limit } }
    );
    return response.data;
  }

  async sendMessage(sessionId: string, content: string): Promise<Message> {
    const response = await this.client.post<Message>(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      { content }
    );
    return response.data;
  }
}

export const api = new ApiClient();

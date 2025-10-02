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
  async register(email: string, password: string, full_name?: string): Promise<User> {
    const response = await this.client.post<User>('/api/v1/auth/register', {
      email,
      password,
      full_name: full_name || null,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // OAuth2 password flow uses form-encoded data with 'username' field
      const formData = new URLSearchParams();
      formData.append('username', email); // Email goes in username field
      formData.append('password', password);
      
      console.log('Sending login request to:', `${API_BASE_URL}/api/v1/auth/login`);
      console.log('Form data:', { username: email });
      
      const response = await this.client.post<LoginResponse>('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Login successful!');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      console.log('Access token:', response.data.access_token?.substring(0, 20) + '...');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login request failed');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  }

  // Chat session endpoints
  async createSession(data?: CreateSessionRequest): Promise<ChatSession> {
    const response = await this.client.post<ChatSession>('/api/v1/chat/sessions', data || {});
    return response.data;
  }

  // Note: Backend doesn't have a GET /sessions endpoint, so we'll store sessions locally
  async getSessions(): Promise<ChatSession[]> {
    // Retrieve sessions from localStorage as fallback
    const stored = localStorage.getItem('chat_sessions');
    if (stored) {
      const sessions = JSON.parse(stored) as ChatSession[];
      return sessions.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    return [];
  }

  // Helper to store session locally
  storeSession(session: ChatSession): void {
    const stored = localStorage.getItem('chat_sessions');
    const sessions = stored ? JSON.parse(stored) : [];
    const existing = sessions.findIndex((s: ChatSession) => s.id === session.id);
    
    if (existing >= 0) {
      sessions[existing] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await this.client.get<Message[]>(
      `/api/v1/chat/sessions/${sessionId}/messages`
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

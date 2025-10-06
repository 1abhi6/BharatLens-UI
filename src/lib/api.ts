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

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/v1/users/me');
    return response.data;
  }

  // Chat session endpoints
  async createSession(data?: CreateSessionRequest): Promise<ChatSession> {
    const response = await this.client.post<ChatSession>('/api/v1/chat/sessions', data || {});
    return response.data;
  }

  // Get all sessions for current user from backend
  async getSessions(): Promise<ChatSession[]> {
    const response = await this.client.get<ChatSession[]>('/api/v1/chat/sessions');
    return response.data.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
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

  async sendMultimodalMessage(params: {
    sessionId: string;
    prompt?: string;
    file?: File;
    audioOutput?: boolean;
    voiceStyle?: string;
  }): Promise<{
    assistant_message: string;
    session_id: string;
    message_id: string;
    uploaded_file_url?: string;
    audio_output_url?: string;
  }> {
    const formData = new FormData();
    formData.append('session_id', params.sessionId);
    if (params.prompt) formData.append('prompt', params.prompt);
    if (params.file) formData.append('file', params.file);
    if (params.audioOutput !== undefined) formData.append('audio_output', params.audioOutput.toString());
    if (params.voiceStyle) formData.append('voice_style', params.voiceStyle);

    const response = await this.client.post('/api/v1/multimodal/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.delete(`/api/v1/chat/sessions/${sessionId}`);
  }
}

export const api = new ApiClient();

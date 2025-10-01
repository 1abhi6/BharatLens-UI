export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface CreateSessionRequest {
  title?: string;
}

export interface CreateMessageRequest {
  content: string;
}

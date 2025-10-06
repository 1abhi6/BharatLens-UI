export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number | null;
}

export interface ChatSession {
  id: string; // UUID
  user_id?: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages?: Message[]; // Optional, included when fetching sessions list
}

export interface Attachment {
  id: string;
  url: string | null;
  media_type: "image" | null;
  metadata_: {
    filename?: string;
    voice_style?: string;
  };
  audio_url: string | null;
  created_at: string;
}

export interface Message {
  id: string; // UUID
  session_id?: string;
  role: "system" | "user" | "assistant";
  content: string;
  created_at: string;
  attachments: Attachment[];
}

export type VoiceStyle = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface CreateSessionRequest {
  title?: string;
}

export interface CreateMessageRequest {
  content: string;
}

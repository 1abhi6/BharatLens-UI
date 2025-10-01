import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SessionList } from '@/components/SessionList';
import { ChatWindow } from '@/components/ChatWindow';
import { useAuth } from '@/hooks/useAuth';

export default function ChatDashboard() {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SessionList 
          activeSessionId={activeSessionId}
          onSessionSelect={setActiveSessionId}
        />
        <div className="flex-1">
          {activeSessionId ? (
            <ChatWindow sessionId={activeSessionId} />
          ) : (
            <div className="flex h-full items-center justify-center bg-[hsl(var(--chat-bg))]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">Welcome to ChatApp</h2>
                <p className="mt-2 text-muted-foreground">Select a chat or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

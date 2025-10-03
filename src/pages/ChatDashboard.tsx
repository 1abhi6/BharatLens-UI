import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SessionList } from '@/components/SessionList';
import { ChatWindow } from '@/components/ChatWindow';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function ChatDashboard() {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SessionList 
          activeSessionId={activeSessionId}
          onSessionSelect={(id) => {
            setActiveSessionId(id);
            // Auto-close sidebar on mobile after selection
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {activeSessionId ? (
              <ChatWindow sessionId={activeSessionId} />
            ) : (
              <div className="flex h-full items-center justify-center bg-[hsl(var(--chat-bg))]">
                <div className="text-center px-4">
                  <h2 className="text-2xl font-semibold text-foreground">Welcome to ChatApp</h2>
                  <p className="mt-2 text-muted-foreground">Select a chat or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

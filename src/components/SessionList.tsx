import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ChatSession } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SessionListProps {
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
}

export const SessionList = ({ activeSessionId, onSessionSelect }: SessionListProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (error) {
      toast({
        title: "Error loading sessions",
        description: "Could not load chat sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const createNewSession = async () => {
    try {
      const newSession = await api.createSession({ title: 'New Chat' });
      setSessions([newSession, ...sessions]);
      onSessionSelect(newSession.id);
      toast({
        title: "New chat created",
      });
    } catch (error) {
      toast({
        title: "Error creating chat",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent session selection when clicking delete
    try {
      await api.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        onSessionSelect(sessions[0]?.id);
      }
      toast({
        title: "Chat deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting chat",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    // Parse ISO date string and convert to local time
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time in local timezone
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    // Show date in local timezone
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex h-full w-80 flex-col border-r border-border bg-[hsl(var(--sidebar-bg))]">
      <div className="border-b border-border p-4">
        <Button 
          onClick={createNewSession}
          className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No chats yet. Start a new conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={cn(
                  "group w-full rounded-lg p-3 text-left transition-colors hover:bg-[hsl(var(--sidebar-hover))]",
                  activeSessionId === session.id && "bg-[hsl(var(--session-active))]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-foreground">
                      {session.title || 'New Chat'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { ChatSession } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SessionListProps {
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SessionList = ({ activeSessionId, onSessionSelect, isOpen, onToggle }: SessionListProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

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

  const handleCreateNewSession = () => {
    setNewChatTitle('');
    setIsDialogOpen(true);
  };

  const createNewSession = async () => {
    const title = newChatTitle.trim();
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your chat",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 20) {
      toast({
        title: "Title too long",
        description: "Title must be 20 characters or less",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSession = await api.createSession({ title });
      setSessions([newSession, ...sessions]);
      onSessionSelect(newSession.id);
      setIsDialogOpen(false);
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
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 flex h-full flex-col bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-in-out",
        isOpen 
          ? "w-80 translate-x-0 border-r border-border" 
          : "w-80 -translate-x-full md:w-0 md:translate-x-0 md:border-0 md:overflow-hidden"
      )}>
        {/* Header */}
        <div className={cn(
          "border-b border-border p-4 transition-opacity duration-300",
          !isOpen && "md:opacity-0 md:pointer-events-none"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Chats</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hidden md:flex h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleCreateNewSession}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Sessions list */}
        <div className={cn(
          "flex-1 overflow-y-auto p-2 transition-opacity duration-300",
          !isOpen && "md:opacity-0 md:pointer-events-none"
        )}>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSessionSelect(session.id)}
                  className={cn(
                    "group w-full rounded-lg p-3 text-left transition-colors hover:bg-[hsl(var(--sidebar-hover))]",
                    activeSessionId === session.id && "bg-[hsl(var(--session-active))]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        onClick={(e) => deleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 cursor-pointer"
                        role="button"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </div>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle button when sidebar is closed - desktop only */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden md:flex absolute left-2 top-20 z-30 h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* New Chat Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter chat title (max 20 characters)"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value.slice(0, 20))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewSession();
                }
              }}
              maxLength={20}
              autoFocus
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {newChatTitle.length}/20 characters
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={createNewSession} className="w-full sm:w-auto">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

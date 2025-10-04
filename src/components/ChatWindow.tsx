import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { api } from '@/lib/api';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

interface ChatWindowProps {
  sessionId: string;
}

export const ChatWindow = ({ sessionId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const scrollPercentage = ((scrollHeight - scrollTop - clientHeight) / scrollHeight) * 100;
      // Show button when scrolled up 10% or more
      setShowScrollButton(scrollPercentage >= 10);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height 150px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSessionMessages(sessionId);
      setMessages(data);
    } catch (error) {
      toast({
        title: "Error loading messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    
    // Add temporary assistant message for loading state
    const tempAssistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempUserMessage, tempAssistantMessage]);

    try {
      const assistantResponse = await api.sendMessage(sessionId, messageContent);
      
      // Replace temp messages with real ones
      setMessages(prev => {
        const filtered = prev.filter(m => 
          m.id !== tempUserMessage.id && m.id !== tempAssistantMessage.id
        );
        const userMessage: Message = {
          ...tempUserMessage,
          id: `user-${Date.now()}`,
          created_at: assistantResponse.created_at,
        };
        return [...filtered, userMessage, assistantResponse];
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        variant: "destructive",
      });
      // Remove temp messages on error
      setMessages(prev => prev.filter(m => 
        m.id !== tempUserMessage.id && m.id !== tempAssistantMessage.id
      ));
      setInput(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--chat-bg))]">
      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Send className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Start a conversation</h3>
              <p className="text-sm text-muted-foreground">Send a message to begin</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 flex justify-center">
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg bg-primary/40 hover:bg-primary transition-all duration-200"
                  onClick={() => scrollToBottom()}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto"
              style={{ minHeight: '60px', maxHeight: '150px' }}
              disabled={isSending}
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

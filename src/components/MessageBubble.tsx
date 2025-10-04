import { Message } from '@/types/chat';
import { User, Bot, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isLoading = message.content === '';
  const [copied, setCopied] = useState(false);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("flex gap-3 p-4 group", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
        isUser 
          ? "bg-[hsl(var(--chat-user))]" 
          : "bg-[hsl(var(--chat-assistant))]"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-[hsl(var(--chat-user-foreground))]" />
        ) : (
          <Bot className="h-4 w-4 text-[hsl(var(--chat-assistant-foreground))]" />
        )}
      </div>
      
      <div className={cn("flex max-w-[70%] flex-col", isUser && "items-end")}>
        <div className="flex items-start gap-2">
          <div className={cn(
            "rounded-2xl px-4 py-2",
            isUser 
              ? "bg-[hsl(var(--chat-user))] text-[hsl(var(--chat-user-foreground))]" 
              : "bg-[hsl(var(--chat-assistant))] text-[hsl(var(--chat-assistant-foreground))]"
          )}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current"></span>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Copy button */}
          {!isLoading && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                isUser && "order-first"
              )}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <span className="mt-1 text-xs text-muted-foreground">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
};

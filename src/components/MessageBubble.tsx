import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("flex gap-3 p-4", isUser && "flex-row-reverse")}>
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
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-[hsl(var(--chat-user))] text-[hsl(var(--chat-user-foreground))]" 
            : "bg-[hsl(var(--chat-assistant))] text-[hsl(var(--chat-assistant-foreground))]"
        )}>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImageViewer } from './ImageViewer';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const isUser = message.role === 'user';
  const isLoading = message.role === 'assistant' && !message.content;
  const hasAudioOutput = message.attachments?.some(att => att.audio_url);

  // Typewriter effect for NEW assistant messages only
  useEffect(() => {
    if (message.role === 'assistant' && message.content && (message as any).isNew) {
      let currentIndex = 0;
      setDisplayedContent('');
      
      const interval = setInterval(() => {
        if (currentIndex <= message.content.length) {
          setDisplayedContent(message.content.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 10);

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.role]);
  
  const formatTime = (dateString: string) => {
    // Parse ISO string and convert to local browser time
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    // Show "Just now" for messages within last minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    // Show "X minutes ago" for messages within last hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    // Show time for today's messages
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Show date and time for older messages
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`flex gap-3 p-4 group ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
        isUser 
          ? "bg-[hsl(var(--chat-user))]" 
          : "bg-[hsl(var(--chat-assistant))]"
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-[hsl(var(--chat-user-foreground))]" />
        ) : (
          <Bot className="h-4 w-4 text-[hsl(var(--chat-assistant-foreground))]" />
        )}
      </div>
      
      <div className={`flex max-w-[70%] flex-col ${isUser ? 'items-end' : ''}`}>
        <div className="flex items-start gap-2">
          <div className={`rounded-2xl px-4 py-2 ${
            isUser 
              ? "bg-[hsl(var(--chat-user))] text-[hsl(var(--chat-user-foreground))]" 
              : "bg-[hsl(var(--chat-assistant))] text-[hsl(var(--chat-assistant-foreground))]"
          }`}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <>
              {!hasAudioOutput && (
                <>
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words text-sm md:text-base">{displayedContent}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-sm [&_p]:md:text-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Image attachments */}
          {message.attachments?.filter(att => att.media_type === 'image' && att.url).map((attachment) => (
            <ImageViewer 
              key={attachment.id}
              src={attachment.url!} 
              alt={attachment.metadata_?.filename || "Uploaded image"} 
            />
          ))}

          {/* Audio attachments */}
          {message.attachments?.filter(att => att.audio_url).map((attachment) => (
            <div key={attachment.id} className="mt-3 w-full max-w-md">
              <div className="rounded-xl bg-muted/50 border border-border p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Audio Response</p>
                    <p className="text-xs text-muted-foreground">
                      Voice: {attachment.metadata_?.voice_style || 'default'}
                    </p>
                  </div>
                </div>
                <audio
                  controls
                  src={attachment.audio_url!}
                  className="w-full h-10 rounded-lg [&::-webkit-media-controls-panel]:bg-background/50 [&::-webkit-media-controls-play-button]:text-primary [&::-webkit-media-controls-overflow-button]:hidden [&::-webkit-media-controls-download-button]:hidden"
                  style={{
                    filter: 'brightness(0.9) contrast(1.1)',
                  }}
                />
              </div>
            </div>
          ))}
          </div>
          
          {/* Copy button */}
          {!isLoading && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
                isUser ? 'order-first' : ''
              }`}
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

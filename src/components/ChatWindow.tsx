import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowDown, ImageIcon, Paperclip, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { AudioRecorder } from './AudioRecorder';
import { CameraCapture } from './CameraCapture';
import { ChatSettings } from './ChatSettings';
import { api } from '@/lib/api';
import { Message, VoiceStyle } from '@/types/chat';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioOutput, setAudioOutput] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('alloy');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
    if ((!input.trim() && !selectedFile) || isSending) return;

    const messageContent = input.trim();
    const fileToSend = selectedFile;
    setInput('');
    setSelectedFile(null);
    setIsSending(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: messageContent || (fileToSend ? `[${fileToSend.type.startsWith('image/') ? 'Image' : 'Audio'} uploaded]` : ''),
      created_at: new Date().toISOString(),
      attachments: [],
    };
    
    // Add temporary assistant message for loading state
    const tempAssistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      attachments: [],
    };
    
    setMessages(prev => [...prev, tempUserMessage, tempAssistantMessage]);

    try {
      const response = await api.sendMultimodalMessage({
        sessionId,
        prompt: messageContent || undefined,
        file: fileToSend || undefined,
        audioOutput,
        voiceStyle,
      });
      
      // Reload messages to get the full structure with attachments
      await loadMessages();
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
      setSelectedFile(fileToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCameraCapture = (imageBlob: Blob) => {
    const file = new File([imageBlob], 'camera-capture.jpg', { type: 'image/jpeg' });
    setSelectedFile(file);
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    setSelectedFile(file);
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
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
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              <Paperclip className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="ml-auto h-6 px-2"
              >
                Remove
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex gap-2">
              {/* Image inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                className="h-10 w-10"
                disabled={isSending}
                title="Select image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <CameraCapture onCapture={handleCameraCapture} />
              
              {/* Audio inputs */}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => audioInputRef.current?.click()}
                className="h-10 w-10"
                disabled={isSending}
                title="Select audio file"
              >
                <Music className="h-5 w-5" />
              </Button>
              <AudioRecorder onRecordingComplete={handleAudioRecorded} />
              
              <ChatSettings
                audioOutput={audioOutput}
                voiceStyle={voiceStyle}
                onAudioOutputChange={setAudioOutput}
                onVoiceStyleChange={setVoiceStyle}
              />
            </div>
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
              disabled={(!input.trim() && !selectedFile) || isSending}
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

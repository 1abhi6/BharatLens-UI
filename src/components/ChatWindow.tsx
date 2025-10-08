import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowDown, ImageIcon, Paperclip, Music, Plus, ArrowUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const documentInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const scrollPercentage = ((scrollHeight - scrollTop - clientHeight) / scrollHeight) * 100;
      // Show button when scrolled up 15% or more
      setShowScrollButton(scrollPercentage >= 15);
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
    const getFileTypeLabel = (file: File) => {
      if (file.type.startsWith('image/')) return 'Image';
      if (file.type.startsWith('audio/')) return 'Audio';
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Document';
      return 'File';
    };
    
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: messageContent || (fileToSend ? `[${getFileTypeLabel(fileToSend)} uploaded]` : ''),
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
      // Build params object, only including properties that have values
      const params: any = { sessionId };
      
      if (messageContent) {
        params.prompt = messageContent;
      }
      
      if (fileToSend) {
        params.file = fileToSend;
      }
      
      if (audioOutput) {
        params.audioOutput = audioOutput;
        params.voiceStyle = voiceStyle;
      }
      
      const response = await api.sendMultimodalMessage(params);
      
      // Build messages from response instead of reloading
      const getMediaType = (file: File): "image" | "audio" | null => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('audio/')) return 'audio';
        return null;
      };
      
      const userMessage: Message = {
        id: response.message_id || `user-${Date.now()}`,
        role: 'user',
        content: messageContent || (fileToSend ? 'Uploaded a file' : ''),
        created_at: new Date().toISOString(),
        attachments: response.uploaded_file_url ? [{
          id: `attachment-${Date.now()}`,
          url: response.uploaded_file_url,
          media_type: getMediaType(fileToSend!),
          metadata_: { filename: fileToSend?.name || '' },
          audio_url: null,
          created_at: new Date().toISOString(),
        }] : [],
      };
      
      // Build attachments array properly
      const attachments: Message['attachments'] = [];
      
      // Add image attachment if present
      if (response.uploaded_file_url && fileToSend?.type.startsWith('image/')) {
        attachments.push({
          id: `img-${Date.now()}`,
          url: response.uploaded_file_url,
          media_type: 'image',
          metadata_: { filename: fileToSend.name },
          audio_url: null,
          created_at: new Date().toISOString(),
        });
      }
      
      // Add document attachment if present (PDF or DOCX)
      if (response.uploaded_file_url && fileToSend && (
        fileToSend.type === 'application/pdf' || 
        fileToSend.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )) {
        attachments.push({
          id: `doc-${Date.now()}`,
          url: response.uploaded_file_url,
          media_type: null,
          metadata_: { filename: fileToSend.name },
          audio_url: null,
          created_at: new Date().toISOString(),
        });
      }
      
      // Add audio attachment if present
      if (response.audio_output_url) {
        attachments.push({
          id: `audio-${Date.now()}`,
          url: null,
          media_type: 'audio',
          metadata_: { voice_style: voiceStyle },
          audio_url: response.audio_output_url,
          created_at: new Date().toISOString(),
        });
      }
      
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.assistant_message,
        created_at: new Date().toISOString(),
        attachments,
        isNew: true // Flag for typewriter effect
      } as any;
      
      // Replace temp messages with actual ones
      setMessages(prev => {
        const filtered = prev.filter(m => 
          m.id !== tempUserMessage.id && m.id !== tempAssistantMessage.id
        );
        return [...filtered, userMessage, assistantMessage];
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
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image size must be less than 5MB. Please upload a smaller file.",
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
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Audio size must be less than 5MB. Please upload a smaller file.",
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

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Document size must be less than 5MB. Please upload a smaller file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--chat-bg))] relative">
      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto relative transition-all duration-300 ${hasMessages ? '' : 'flex items-center justify-center'}`}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasMessages ? (
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              What can I help with?
            </h1>
          </div>
        ) : (
          <>
            <div className="space-y-2 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Scroll to bottom button with fade animation */}
            <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${
              showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                onClick={() => scrollToBottom()}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Input area */}
      <div className={`border-t border-border bg-card transition-all duration-300 ${hasMessages ? 'p-4' : 'p-4'}`}>
        <div className={`mx-auto transition-all duration-300 ${hasMessages ? 'max-w-4xl' : 'max-w-3xl'}`}>
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              <Paperclip className="h-4 w-4" />
              <span className="truncate">{selectedFile.name}</span>
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
          <div className="relative flex items-center gap-2">
            {/* Add button with tools dropdown */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileSelect}
              className="hidden"
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleDocumentSelect}
              className="hidden"
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 flex-shrink-0 rounded-full hover:bg-accent"
                  disabled={isSending}
                  title="Add attachments"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Image <span className="text-xs text-muted-foreground">(max 5MB)</span></span>
                  </Button>
                  <CameraCapture onCapture={handleCameraCapture} />
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Music className="h-4 w-4" />
                    <span>Upload Audio <span className="text-xs text-muted-foreground">(max 5MB)</span></span>
                  </Button>
                  <AudioRecorder onRecordingComplete={handleAudioRecorded} />
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Upload Document <span className="text-xs text-muted-foreground">(max 5MB)</span></span>
                  </Button>
                  <div className="border-t my-1" />
                  <ChatSettings
                    audioOutput={audioOutput}
                    voiceStyle={voiceStyle}
                    onAudioOutputChange={setAudioOutput}
                    onVoiceStyleChange={setVoiceStyle}
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Input with integrated send button */}
            <div className="relative flex-1">
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
                placeholder="Message..."
                className="w-full rounded-3xl border border-input bg-background pl-4 pr-12 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto"
                style={{ minHeight: '52px', maxHeight: '150px' }}
                disabled={isSending}
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedFile) || isSending}
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full disabled:opacity-30 hover:bg-accent"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

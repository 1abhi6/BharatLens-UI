import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoiceStyle } from '@/types/chat';

interface ChatSettingsProps {
  audioOutput: boolean;
  voiceStyle: VoiceStyle;
  onAudioOutputChange: (enabled: boolean) => void;
  onVoiceStyleChange: (style: VoiceStyle) => void;
}

export const ChatSettings = ({
  audioOutput,
  voiceStyle,
  onAudioOutputChange,
  onVoiceStyleChange,
}: ChatSettingsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="icon" variant="outline" className="h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="audio-output" className="text-base">
              Audio Output
            </Label>
            <Switch
              id="audio-output"
              checked={audioOutput}
              onCheckedChange={onAudioOutputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voice-style" className="text-base">
              Voice Style
            </Label>
            <Select value={voiceStyle} onValueChange={(value) => onVoiceStyleChange(value as VoiceStyle)}>
              <SelectTrigger id="voice-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy (Neutral / Default)</SelectItem>
                <SelectItem value="echo">Echo (Warm and resonant)</SelectItem>
                <SelectItem value="fable">Fable (Clear and articulate)</SelectItem>
                <SelectItem value="onyx">Onyx (Deep and commanding)</SelectItem>
                <SelectItem value="nova">Nova (Bright and energetic)</SelectItem>
                <SelectItem value="shimmer">Shimmer (Smooth and calming)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

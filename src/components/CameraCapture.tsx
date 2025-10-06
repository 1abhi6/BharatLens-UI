import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
}

export const CameraCapture = ({ onCapture }: CameraCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsOpen(true);
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture photos",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={startCamera}
        className="h-10 w-10"
      >
        <Camera className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capture Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={stopCamera}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

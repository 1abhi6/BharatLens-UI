import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ZoomIn } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
}

export const ImageViewer = ({ src, alt }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto max-h-64 rounded-lg border object-contain"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0" aria-describedby="image-viewer-description">
          <p id="image-viewer-description" className="sr-only">Full size image view with download option</p>
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleDownload}
                className="h-10 w-10 rounded-full shadow-lg"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-full shadow-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <img 
              src={src} 
              alt={alt}
              className="w-full h-full object-contain max-h-[95vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

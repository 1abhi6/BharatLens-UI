import { Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Created by <span className="font-semibold text-foreground">Abhishek Gupta</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <a
              href="https://github.com/1abhi6"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <a
              href="https://www.linkedin.com/in/iautomates/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
};

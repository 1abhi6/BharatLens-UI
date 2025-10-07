import { Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="py-3 px-4 bg-transparent">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/1abhi6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            aria-label="GitHub"
          >
            <Github className="h-3 w-3" />
          </a>
          <a
            href="https://www.linkedin.com/in/iautomates/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-3 w-3" />
          </a>
        </div>
        <span>© {new Date().getFullYear()} Created by Abhishek Gupta</span>
      </div>
    </footer>
  );
};

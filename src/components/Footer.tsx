import { Github, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-4 px-4 bg-transparent border-t border-border/50">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Developed with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>by Abhishek Gupta</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://linkedin.com/in/iautomates"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 hover:scale-110 inline-flex items-center gap-1.5"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a
            href="https://github.com/1abhi6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 hover:scale-110 inline-flex items-center gap-1.5"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} BharatLens. All rights reserved.</p>
      </div>
    </footer>
  );
};

import { Github, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-3 px-4 bg-transparent">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/1abhi6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 hover:scale-110 inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/50 hover:bg-primary/10"
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://www.linkedin.com/in/iautomates/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 hover:scale-110 inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/50 hover:bg-primary/10"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        </div>
        <span>© {new Date().getFullYear()} Created by Abhishek Gupta</span>
      </div>
    </footer>
  );
};

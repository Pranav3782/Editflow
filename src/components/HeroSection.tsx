import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Mail, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import InteractiveEditorPlanner from './InteractiveEditorPlanner';

const DiscordIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2763-3.68-.2763-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
  </svg>
);

const SubstackIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="2" width="16" height="4" rx="1" />
    <path d="M4 8h16v14l-8-4-8 4V8z" />
  </svg>
);

const LinktreeIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const HeroSection = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email.trim().length > 0) {
      toast.success("Thanks for subscribing!");
      setTimeout(() => {
        window.open('https://linktr.ee/entrext.pro', '_blank', 'noopener,noreferrer');
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-foreground dark:bg-transparent dark:border dark:border-primary dark:text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Now scheduling 500+ agencies
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Plan Editor Work
            <br />
            <span className="text-primary">Without Chaos</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A simple weekly planner that shows exactly who's editing what — today, tomorrow, and next week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8 gap-2 h-12">
              <Link to="/planner">
                Try Planner Free
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-secondary gap-2 h-12 px-8">
              <a href="#interactive-demo">
                <Play size={18} />
                See How It Works
              </a>
            </Button>

          </div>
        </div>

        {/* Planner Preview Container */}
        <div id="interactive-demo" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-warning/10 to-success/20 rounded-3xl blur-2xl opacity-50" />

            {/* Planner */}
            <div className="relative">
              <InteractiveEditorPlanner />
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-24 max-w-2xl mx-auto text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-8">
            Stay in the loop & join our community
          </h3>

          <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center max-w-md mx-auto mb-10 shadow-xl hover:border-primary/20 transition-all duration-300">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none px-6 py-2 focus:outline-none text-foreground placeholder:text-muted-foreground/50 min-w-0 font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              className="rounded-full px-8 bg-warning hover:bg-warning/90 text-primary-foreground font-semibold shadow-lg h-10"
              onClick={handleSubscribe}
            >
              Subscribe
            </Button>
          </div>

          <div className="flex justify-center items-center gap-6">
            <a
              href="https://www.instagram.com/entrext.labs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://discord.com/invite/ZZx3cBrx2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
              aria-label="Discord"
            >
              <DiscordIcon size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/entrext/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://entrextlabs.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
              aria-label="Substack"
            >
              <SubstackIcon size={20} />
            </a>
            <a
              href="https://linktr.ee/entrext.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
              aria-label="Linktree"
            >
              <LinktreeIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

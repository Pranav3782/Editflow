import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import InteractiveEditorPlanner from './InteractiveEditorPlanner';
import { SOCIAL_LINKS } from './SocialIcons';

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
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5"
                aria-label={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

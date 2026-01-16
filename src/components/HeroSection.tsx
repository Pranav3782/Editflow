import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveEditorPlanner from './InteractiveEditorPlanner';

const HeroSection = () => {
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
            <Button asChild size="lg" variant="outline" className="text-warning border-warning hover:bg-warning/10 hover:text-warning gap-2 h-12 px-8">
              <a
                href="https://linktr.ee/entrext.pro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join the EditFlow newsletter"
              >
                <Mail size={18} />
                Join the Newsletter
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

      </div>
    </section>
  );
};

export default HeroSection;

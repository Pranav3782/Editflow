import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, BarChart3, Clock, Check } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Scheduling',
    description: 'Automatically balance workloads across your team',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Insights on editor performance and capacity trends',
  },
  {
    icon: Clock,
    title: 'Deadline Optimization',
    description: 'Never miss a deadline with intelligent prioritization',
  },
];

const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 shadow-strong">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Unlock AI Optimization
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upgrade to Premium to access intelligent workload balancing and more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2"
            onClick={() => {
              window.location.href = '/#pricing';
              onClose();
            }}
          >
            <Check size={16} />
            Upgrade to Premium
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          14-day free trial · No credit card required
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;

import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out EditFlow',
    features: [
      'Up to 2 editors',
      'Weekly planner view',
      'Basic job cards',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing creative agencies',
    features: [
      'Up to 10 editors',
      'Weekly & monthly views',
      'Priority & status tags',
      'Capacity tracking',
      'Client management',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },

];

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const startCheckout = async (plan: string) => {
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan,
          email: user?.email,
          name: user?.user_metadata?.full_name || user?.email // Fallback to email if name missing
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // This usually happens when Vite returns the HTML index page for a 404 API route
        const text = await res.text();
        console.error("API Error (Non-JSON response):", text.slice(0, 200));
        throw new Error("API endpoint not working. Are you running with 'npx vercel dev'?");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
      console.error(error);
    }
  };

  const handlePlanClick = (planName: string) => {
    const plan = planName.toLowerCase();

    if (plan === 'starter') {
      navigate(user ? '/planner' : '/auth');
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    if (plan === 'pro') {
      startCheckout('pro');
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${plan.highlighted
                ? 'bg-card border-2 border-primary shadow-glow-lg scale-105'
                : 'bg-card border border-border/50 shadow-soft hover:shadow-medium'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full gap-2 mt-auto ${plan.highlighted
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;

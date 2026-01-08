import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out EditFlow',
    features: [
      'Up to 2 editors',
      'Weekly planner view',
      'Basic job cards',
      'Email support',
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
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$79',
    period: '/month',
    description: 'For larger teams with advanced needs',
    features: [
      'Unlimited editors',
      'AI workload optimization',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const PricingSection = () => {
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

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
                plan.highlighted
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
                className={`w-full gap-2 mt-auto ${
                  plan.highlighted
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

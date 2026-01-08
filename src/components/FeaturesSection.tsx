import { Calendar, Users, Clock, BarChart3, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Weekly Planning View',
    description: 'See your entire week at a glance. Drag and drop jobs between days and editors effortlessly.',
  },
  {
    icon: Users,
    title: 'Team Capacity Tracking',
    description: 'Real-time capacity indicators show who has bandwidth and who needs help.',
  },
  {
    icon: Clock,
    title: 'Deadline Management',
    description: 'Never miss a deadline. Priority tags and due dates keep everyone aligned.',
  },
  {
    icon: BarChart3,
    title: 'Workload Analytics',
    description: 'Understand team performance trends and optimize your scheduling over time.',
  },
  {
    icon: Zap,
    title: 'AI Optimization',
    description: 'Premium feature that automatically balances workloads across your team.',
  },
  {
    icon: Shield,
    title: 'Client Management',
    description: 'Track jobs by client, maintain relationships, and ensure quality delivery.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to
            <br />
            <span className="text-primary">Manage Your Team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built specifically for content and video agencies with 2–5 editors handling 20+ videos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-hover p-6 rounded-2xl bg-background border border-border/50 shadow-soft"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary dark:text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

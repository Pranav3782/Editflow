import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is EditFlow?",
        answer: "EditFlow is a visual workload planner designed specifically for video editing agencies. It helps you schedule jobs, manage team capacity, and ensure deadlines are met without the chaos of spreadsheets."
    },
    {
        question: "How does the capacity tracking work?",
        answer: "You set the daily capacity (in hours) for each editor. As you assign jobs with estimated hours, EditFlow automatically calculates their workload and uses color-coded indicators (Green, Yellow, Red) to show if they are open, near capacity, or overloaded."
    },
    {
        question: "Can I try it for free?",
        answer: "Yes! We offer a generous free tier that includes up to 2 editors and basic planning features. You can upgrade to the Pro plan anytime as your team grows."
    },

    {
        question: "How secure is my data?",
        answer: "We take security seriously. All your data is encrypted in transit and at rest. We use industry-standard authentication (Supabase) to ensure only your team can access your workspace."
    }
];

const FAQSection = () => {
    return (
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Everything you need to know about EditFlow.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                            <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors py-4 text-lg font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;

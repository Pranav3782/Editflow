import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Editor Flow handle team capacity planning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Editor Flow uses a visual weekly planner to show exactly who is editing what. It calculates daily hours for each editor and alerts you when they are over capacity."
      }
    },
    {
      "@type": "Question",
      "name": "Can I share intake forms directly with clients?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can generate unique, secure links for client intake forms that feed directly into your project backlog."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free tier for individual editors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Editor Flow offers a Free tier that includes basic planning features, perfect for freelancers and small teams."
      }
    },
    {
      "@type": "Question",
      "name": "Does Editor Flow integrate with Google Calendar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Direct Google Calendar integration is available in the Pro plan, allowing you to sync project deadlines automatically."
      }
    },
    {
      "@type": "Question",
      "name": "How secure is the client data in Editor Flow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We prioritize security with encrypted data storage and secure authentication methods to protect your client and project information."
      }
    }
  ]
};

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Editor Flow - Video Editor Project Management & Capacity Planning"
        description="The ultimate post-production workflow planner. Schedule creative teams, manage video editor capacity, and streamline client intake in one visual tool."
        keywords="Video Editor Project Management Software, Post-Production Workflow Planner, Creative Team Resource Scheduling, Client Intake Forms for Video Editors, Video Production Calendar Tool"
        schema={faqSchema}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

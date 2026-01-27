import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";

import { useTheme } from "@/hooks/useTheme";

const queryClient = new QueryClient();

import Link from "react-router-dom"; // unused? No.
import PaymentSuccess from "@/pages/PaymentSuccess";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import ClientIntake from "@/pages/ClientIntake";
import ClientView from "@/pages/ClientView";
import BlogList from "@/pages/BlogList";
import BlogPostPage from "@/pages/BlogPost";
import ScrollToTop from "@/components/ScrollToTop";

const App = () => {
  useTheme(); // Initialize theme globally

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/intake/:userId" element={<ClientIntake />} />
              <Route path="/view/:token" element={<ClientView />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

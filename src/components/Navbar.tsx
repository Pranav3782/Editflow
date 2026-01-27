import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav shadow-soft' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="EditFlow logo" className="h-8 w-auto object-contain flex-shrink-0 rounded-xl" />
            <span className="font-semibold text-lg text-foreground">EditFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Features
            </a>
            <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Pricing
            </a>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Blog
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Login
            </Link>
            <ThemeToggle />
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow">
              <Link to="/planner">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">
                Features
              </a>
              <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">
                Pricing
              </a>
              <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2 text-left">
                Blog
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2 text-left">
                Login
              </Link>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow w-full">
                <Link to="/planner">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

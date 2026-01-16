import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#about", label: "من نحن" },
  { href: "#activities", label: "أنشطتنا" },
  { href: "/structure", label: "الهيكل الإداري" },
  { href: "#join", label: "انضم إلينا" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? "bg-background/90 backdrop-blur-lg border-b border-border/50"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img
              src={logo}
              alt="الجبهة الدبلوماسية المصرية"
              className="w-12 h-12 object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gradient-gold">
                الجبهة الدبلوماسية
              </p>
              <p className="text-xs text-muted-foreground">
                Egyptian Diplomatic Front
              </p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </a>
              )
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="border-primary text-secondary hover:bg-primary hover:text-white">
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <a href="#join">انضم الآن</a>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-lg md:hidden pt-24"
          >
            <nav className="flex flex-col items-center gap-6 p-8">
              {navLinks.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="flex flex-col gap-4 w-full">
                <Button variant="outline" size="lg" asChild className="w-full border-primary text-secondary hover:bg-primary hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full"
                >
                  <a href="#join">انضم الآن</a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

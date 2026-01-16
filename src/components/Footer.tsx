import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Facebook, Instagram, Linkedin, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 px-4 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-right"
          >
            <img
              src={logo}
              alt="الجبهة الدبلوماسية المصرية"
              className="w-24 h-24 object-contain mx-auto md:mx-0 mb-4"
            />
            <h3 className="text-xl font-bold text-gradient-gold mb-2">
              الجبهة الدبلوماسية المصرية
            </h3>
            <p className="text-muted-foreground text-sm">
              Egyptian Diplomatic Front
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              كيان شبابي تابع لوزارة الشباب والرياضة
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h4 className="text-lg font-bold text-foreground mb-6">
              روابط سريعة
            </h4>
            <nav className="space-y-3">
              <a
                href="#about"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                من نحن
              </a>
              <a
                href="#activities"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                أنشطتنا
              </a>
              <a
                href="#join"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                انضم إلينا
              </a>
            </nav>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h4 className="text-lg font-bold text-foreground mb-6">
              تواصل معنا
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>جمهورية مصر العربية</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>info@edf.eg</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              <a
                href="https://www.facebook.com/share/16WvLw2TUV/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/egyptian.diplomatic.front?igsh=MWxocnAwM2lweXQwOQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/egyption-diplomatic-front/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border/30 text-center"
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} الجبهة الدبلوماسية المصرية الشبابية. جميع الحقوق محفوظة.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

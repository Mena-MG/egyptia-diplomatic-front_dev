import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const { t, isRTL } = useLanguage();
  const { signIn, user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in based on role
  useEffect(() => {
    if (!loading && user && userRole) {
      if (userRole === 'admin') {
        navigate('/admin/users', { replace: true });
      } else if (userRole === 'hr') {
        navigate('/hr/dashboard', { replace: true });
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: t('common', 'error'),
        description: t('auth', 'invalidCredentials'),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: t('common', 'success'),
      description: t('auth', 'loginSuccess'),
    });
    
    // Role-based redirect will happen via useEffect when userRole is fetched
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Switcher - Fixed Position */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`hidden lg:flex lg:w-1/2 bg-background flex-col items-center justify-center p-12 ${isRTL ? 'order-2' : 'order-1'}`}
      >
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative bg-secondary/80 rounded-2xl p-8 border border-primary/30">
            <img src={logo} alt="EDF Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
            EGYPTIAN DIPLOMATIC FRONT
          </h1>
          <p className="text-primary font-cairo text-xl mb-4">
            الجبهة الدبلوماسية المصرية
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mb-6 rounded-full" />
          <p className="text-muted-foreground text-sm max-w-md">
            {t('auth', 'tagline')}
          </p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full lg:w-1/2 flex items-center justify-center p-8 bg-card ${isRTL ? 'order-1' : 'order-2'}`}
      >
        <div className="w-full max-w-md">
          {/* Secure Access Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium">
              <Lock className="w-4 h-4" />
              {t('auth', 'secureAccess')}
            </span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-playfair font-bold text-foreground mb-2">
              {t('auth', 'loginTitle')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('auth', 'loginSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('auth', 'username')}
              </label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth', 'enterUsername')}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} bg-secondary/50 border-border focus:border-primary`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('auth', 'password')}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} bg-secondary/50 border-border focus:border-primary`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  {t('auth', 'rememberMe')}
                </label>
              </div>
              <button type="button" className="text-sm text-primary hover:underline">
                {t('auth', 'forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-medium"
            >
              <LogIn className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isLoading ? t('auth', 'signingIn') : t('auth', 'signIn')}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 border-t border-border" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>{t('auth', 'copyright')}</p>
            <p>{t('auth', 'authorizedOnly')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  Calendar,
  Building2,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import logo from '@/assets/logo.png';

interface HRLayoutProps {
  children: ReactNode;
}

const hrNavItems = [
  { icon: LayoutDashboard, labelKey: 'dashboard', href: '/hr/dashboard' },
  { icon: Users2, labelKey: 'evaluations', href: '/hr/evaluations' },
  { icon: Users, labelKey: 'applicants', href: '/hr/applications' },
  { icon: BarChart3, labelKey: 'reports', href: '/hr/reports' },
  { icon: Settings, labelKey: 'settings', href: '/admin/settings' },
];

const adminNavItems = [
  { icon: Shield, labelKey: 'users', href: '/admin/users' },
  { icon: Building2, labelKey: 'committees', href: '/admin/committees' },
  { icon: FileText, labelKey: 'contentManagement', href: '/admin/content' },
  { icon: Calendar, labelKey: 'eventsManagement', href: '/admin/events' },
  { icon: Building2, labelKey: 'structureManagement', href: '/admin/structure' },
  { icon: Settings, labelKey: 'settings', href: '/admin/settings' },
];

export default function HRLayout({ children }: HRLayoutProps) {
  const { t, isRTL } = useLanguage();
  const { user, isAdmin, isHR, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || (!isHR && !isAdmin)) {
    return null;
  }

  const isActive = (href: string) => location.pathname === href;

  const userName = 'Ahmed Hassan';
  const userRole = isAdmin ? 'Admin' : t('common', 'hrManager');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <Link to="/" className="block">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="EDF" className="w-10 h-10 object-contain" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {/* HR Navigation (for HR and Admin) */}
          {(isHR || isAdmin) && (
            <>
              {hrNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{t('nav', item.labelKey)}</span>
                    {active && (
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />
                    )}
                  </Link>
                );
              })}
            </>
          )}

          {/* Admin Navigation (Admin only) */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
                </p>
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{t('nav', item.labelKey)}</span>
                    {active && (
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-primary/30">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              AH
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userRole}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title={t('common', 'logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-56 bg-sidebar border-${isRTL ? 'l' : 'r'} border-sidebar-border hidden lg:block z-40`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isRTL ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 280 : -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-sidebar z-50 lg:hidden`}
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-2 rounded-lg hover:bg-sidebar-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
              <div className="px-4 pb-4">
                <LanguageSwitcher />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${isRTL ? 'lg:mr-56' : 'lg:ml-56'} min-h-screen`}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img src={logo} alt="EDF" className="w-8 h-8 object-contain" />
            <LanguageSwitcher variant="compact" />
          </div>
        </header>

        {/* Desktop Language Switcher */}
        <div className="hidden lg:flex justify-end p-4">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Page Content */}
        <main className="px-4 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
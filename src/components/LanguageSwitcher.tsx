import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/i18n/LanguageContext';

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'sm' : 'default'}
          className="gap-2 text-foreground hover:text-primary hover:bg-primary/10"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'AR'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`cursor-pointer ${language === 'en' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <span className="mr-2">🇬🇧</span>
          {t('language', 'english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('ar')}
          className={`cursor-pointer ${language === 'ar' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <span className="mr-2">🇪🇬</span>
          {t('language', 'arabic')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

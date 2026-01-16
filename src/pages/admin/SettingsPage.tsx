import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Shield, Bell, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    websiteName: 'Egyptian Diplomatic Front',
    contactEmail: 'info@edf.gov.eg',
    defaultLanguage: 'ar',
    timezone: 'Africa/Cairo',
    maintenanceMode: false,
    twoFactorAuth: true,
    strongPassword: true,
    sessionTimeout: '30',
    facebookUrl: 'https://facebook.com/EgyptianDiplomaticFront',
    twitterUrl: 'https://twitter.com/edf',
    linkedinUrl: 'https://linkedin.com/company/egyptian-diplomatic-front',
  });

  const handleSave = () => {
    toast({ title: t('common', 'success'), description: 'Settings saved successfully!' });
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('nav', 'settings')}
            </h1>
            <p className="text-muted-foreground">Manage website configuration and access control</p>
          </div>
          <Button onClick={handleSave}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6">
          {/* General Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  General Configuration
                </CardTitle>
                <CardDescription>Basic website information and regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Website Name</Label>
                    <Input 
                      value={settings.websiteName}
                      onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select 
                      value={settings.defaultLanguage} 
                      onValueChange={(v) => setSettings({ ...settings, defaultLanguage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic (Egypt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input 
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Cairo">Africa/Cairo (GMT+3)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Put the site offline for visitors while you make changes.</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security & Login */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security & Login
                </CardTitle>
                <CardDescription>Manage password policies and session security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-muted-foreground">Force 2FA for all administrator accounts.</p>
                  </div>
                  <Switch 
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(v) => setSettings({ ...settings, twoFactorAuth: v })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Strong Password Policy</p>
                    <p className="text-sm text-muted-foreground">Require special characters and numbers.</p>
                  </div>
                  <Switch 
                    checked={settings.strongPassword}
                    onCheckedChange={(v) => setSettings({ ...settings, strongPassword: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Admin Session Timeout</Label>
                  <Select 
                    value={settings.sessionTimeout} 
                    onValueChange={(v) => setSettings({ ...settings, sessionTimeout: v })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="120">2 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Integrations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect external social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input 
                    value={settings.facebookUrl}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X URL</Label>
                  <Input 
                    value={settings.twitterUrl}
                    onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input 
                    value={settings.linkedinUrl}
                    onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </HRLayout>
  );
}

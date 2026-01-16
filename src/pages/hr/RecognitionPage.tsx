import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, AlertTriangle, Plus, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function RecognitionPage() {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('recognition');

  const { data: recognitions, isLoading: loadingRecognitions } = useQuery({
    queryKey: ['recognitions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('recognition_actions')
        .select('*, member:member_id(full_name)')
        .order('action_date', { ascending: false });
      return data || [];
    },
  });

  const { data: disciplinary, isLoading: loadingDisciplinary } = useQuery({
    queryKey: ['disciplinary'],
    queryFn: async () => {
      const { data } = await supabase
        .from('disciplinary_actions')
        .select('*, member:member_id(full_name)')
        .order('action_date', { ascending: false });
      return data || [];
    },
  });

  const recognitionTypeLabels: Record<string, string> = {
    appreciation: 'Appreciation',
    award: 'Award',
    certificate: 'Certificate',
    promotion: 'Promotion',
    bonus: 'Bonus',
    public_recognition: 'Public Recognition',
  };

  const disciplinaryTypeLabels: Record<string, string> = {
    verbal_warning: 'Verbal Warning',
    written_warning: 'Written Warning',
    final_warning: 'Final Warning',
    suspension: 'Suspension',
    termination: 'Termination',
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('nav', 'recognition')}
            </h1>
            <p className="text-muted-foreground">Manage recognition and disciplinary actions</p>
          </div>
          <Button>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            Add Action
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="recognition" className="gap-2">
              <Award className="w-4 h-4" />
              Recognition
            </TabsTrigger>
            <TabsTrigger value="disciplinary" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Disciplinary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recognition" className="mt-6">
            <div className="grid gap-4">
              {loadingRecognitions ? (
                <Card className="bg-card border-border p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </Card>
              ) : recognitions?.length === 0 ? (
                <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                  {t('common', 'noData')}
                </Card>
              ) : (
                recognitions?.map((rec) => (
                  <motion.div key={rec.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="bg-card border-border hover:border-green-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Award className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                              <h3 className="font-medium">{rec.member?.full_name}</h3>
                              <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500 border-green-500/20">
                                {recognitionTypeLabels[rec.recognition_type] || rec.recognition_type}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">{rec.reason}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(rec.action_date), 'MMM dd, yyyy', { locale: language === 'ar' ? ar : undefined })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="disciplinary" className="mt-6">
            <div className="grid gap-4">
              {loadingDisciplinary ? (
                <Card className="bg-card border-border p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </Card>
              ) : disciplinary?.length === 0 ? (
                <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                  {t('common', 'noData')}
                </Card>
              ) : (
                disciplinary?.map((disc) => (
                  <motion.div key={disc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="bg-card border-border hover:border-red-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                              <h3 className="font-medium">{disc.member?.full_name}</h3>
                              <Badge variant="outline" className="mt-1 bg-red-500/10 text-red-500 border-red-500/20">
                                {disciplinaryTypeLabels[disc.disciplinary_type] || disc.disciplinary_type}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">{disc.reason}</p>
                              {disc.outcome && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <strong>Outcome:</strong> {disc.outcome}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(disc.action_date), 'MMM dd, yyyy', { locale: language === 'ar' ? ar : undefined })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </HRLayout>
  );
}

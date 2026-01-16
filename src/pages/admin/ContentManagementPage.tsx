import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, BarChart3, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ContentManagementPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch site content
  const { data: siteContent, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .order('section, display_order');
      return data || [];
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data: user } = await supabase.auth.getUser();

      // Check if content exists
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('content_key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_content')
          .update({
            content_value: value,
            updated_by: user.user?.id
          })
          .eq('content_key', key);
        if (error) throw error;
      } else {
        // Determine section and type from key
        let section = 'about';
        let contentType = 'text';
        if (key.includes('stat_')) section = 'statistics';
        if (key.includes('goal_')) section = 'about';
        if (key.includes('vision') || key.includes('mission') || key.includes('values')) section = 'about';
        if (key.match(/\d+/)) contentType = 'number';

        const { error } = await supabase
          .from('site_content')
          .insert({
            content_key: key,
            content_value: value,
            content_type: contentType,
            language: key.endsWith('_en') ? 'en' : 'ar',
            section: section,
            updated_by: user.user?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({ title: t('common', 'success'), description: 'Content updated successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const getContentValue = (key: string) => {
    return siteContent?.find(c => c.content_key === key)?.content_value || '';
  };

  const handleSave = (key: string, value: string) => {
    updateContentMutation.mutate({ key, value });
  };

  // About Section Content
  const aboutFields = [
    { key: 'vision_ar', label: 'الرؤية (عربي)', defaultValue: 'أن تصبح الجبهة الدبلوماسية المصرية منصة وطنية شبابية رائدة، تُعبر عن صوت الشباب المصري داخليًا وخارجيًا، وتسهم في بناء جيل واعٍ بالقضايا الوطنية والدولية.' },
    { key: 'vision_en', label: 'Vision (English)', defaultValue: 'To become a leading national youth platform that expresses the voice of Egyptian youth internally and externally, and contributes to building a generation aware of national and international issues.' },
    { key: 'mission_ar', label: 'الرسالة (عربي)', defaultValue: 'تمكين الشباب المصري ليكون عنصرًا فاعلًا في المسار الوطني والدبلوماسي، عبر التوعية السياسية، والتأهيل القيادي، وصناعة كوادر شبابية قادرة على تمثيل مصر.' },
    { key: 'mission_en', label: 'Mission (English)', defaultValue: 'Empowering Egyptian youth to be an active element in the national and diplomatic path, through political awareness, leadership development, and building young cadres capable of representing Egypt.' },
    { key: 'values_ar', label: 'القيم (عربي)', defaultValue: 'الوطنية • الالتزام • الشفافية • التمكين • الانتماء • التأثير المسؤول' },
    { key: 'values_en', label: 'Values (English)', defaultValue: 'Nationalism • Commitment • Transparency • Empowerment • Belonging • Responsible Impact' },
  ];

  const goalFields = [
    { key: 'goal_1_ar', label: 'الهدف 1 (عربي)', defaultValue: 'تعزيز الوعي السياسي والهوية الوطنية لدى الشباب' },
    { key: 'goal_2_ar', label: 'الهدف 2 (عربي)', defaultValue: 'نشر ثقافة الدبلوماسية العامة والاتصال الدولي' },
    { key: 'goal_3_ar', label: 'الهدف 3 (عربي)', defaultValue: 'بناء كوادر شبابية في مجالات الشأن العام والسياسات الدولية' },
    { key: 'goal_4_ar', label: 'الهدف 4 (عربي)', defaultValue: 'دعم المبادرات الشبابية الوطنية' },
    { key: 'goal_5_ar', label: 'الهدف 5 (عربي)', defaultValue: 'تمثيل الشباب المصري في المحافل الإقليمية والدولية' },
  ];

  // Statistics
  const statFields = [
    { key: 'stat_members', label: 'عدد الأعضاء', defaultValue: '36,000+' },
    { key: 'stat_governorates', label: 'عدد المحافظات', defaultValue: '28' },
    { key: 'stat_countries', label: 'عدد الدول', defaultValue: '8' },
    { key: 'stat_events', label: 'عدد الفعاليات', defaultValue: '1,240+' },
    { key: 'stat_youth_percentage', label: 'نسبة الشباب', defaultValue: '87%' },
    { key: 'stat_media_appearances', label: 'الظهور الإعلامي', defaultValue: '100+' },
  ];

  if (isLoading) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              إدارة المحتوى
            </h1>
            <p className="text-muted-foreground">تعديل النصوص والإحصائيات المعروضة على الموقع</p>
          </div>
        </div>

        <Tabs defaultValue="about" className="space-y-4">
          <TabsList>
            <TabsTrigger value="about">
              <FileText className="w-4 h-4 mr-2" />
              من نحن
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              الإحصائيات
            </TabsTrigger>
          </TabsList>

          {/* About Section */}
          <TabsContent value="about" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    معلومات الجبهة
                  </CardTitle>
                  <CardDescription>تعديل الرؤية، الرسالة، والقيم</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {aboutFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Textarea
                        value={getContentValue(field.key) || field.defaultValue}
                        onChange={(e) => {
                          const content = [...(siteContent || [])];
                          const index = content.findIndex(c => c.content_key === field.key);
                          if (index >= 0) {
                            content[index].content_value = e.target.value;
                          }
                        }}
                        onBlur={(e) => handleSave(field.key, e.target.value)}
                        rows={3}
                        className="font-cairo"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>الأهداف</CardTitle>
                  <CardDescription>تعديل أهداف الجبهة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        value={getContentValue(field.key) || field.defaultValue}
                        onChange={(e) => {
                          const content = [...(siteContent || [])];
                          const index = content.findIndex(c => c.content_key === field.key);
                          if (index >= 0) {
                            content[index].content_value = e.target.value;
                          }
                        }}
                        onBlur={(e) => handleSave(field.key, e.target.value)}
                        className="font-cairo"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Statistics Section */}
          <TabsContent value="statistics" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    الإحصائيات
                  </CardTitle>
                  <CardDescription>تعديل الأرقام والإحصائيات المعروضة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {statFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>
                        <Input
                          value={getContentValue(field.key) || field.defaultValue}
                          onChange={(e) => {
                            const content = [...(siteContent || [])];
                            const index = content.findIndex(c => c.content_key === field.key);
                            if (index >= 0) {
                              content[index].content_value = e.target.value;
                            }
                          }}
                          onBlur={(e) => handleSave(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </HRLayout>
  );
}

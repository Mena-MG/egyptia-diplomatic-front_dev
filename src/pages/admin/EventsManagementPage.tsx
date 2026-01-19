import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Edit, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function EventsManagementPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    event_date: '',
    is_featured: false,
    display_order: 0,
  });

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order');
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('events').insert({
        ...formData,
        created_by: user.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: t('common', 'success'), description: 'Event created successfully!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('events')
        .update(formData)
        .eq('id', editingEvent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: t('common', 'success'), description: 'Event updated successfully!' });
      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: t('common', 'success'), description: 'Event deleted successfully!' });
      setDeleteEventId(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      event_date: '',
      is_featured: false,
      display_order: 0,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title_ar: event.title_ar || '',
      title_en: event.title_en || '',
      description_ar: event.description_ar || '',
      description_en: event.description_en || '',
      event_date: event.event_date ? format(new Date(event.event_date), 'yyyy-MM-dd') : '',
      is_featured: event.is_featured || false,
      display_order: event.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingEvent) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

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
              إدارة الفعاليات
            </h1>
            <p className="text-muted-foreground">تعديل وإضافة الفعاليات البارزة</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingEvent(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                إضافة فعالية
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'تعديل فعالية' : 'إضافة فعالية جديدة'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>العنوان (عربي) *</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="font-cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (English)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                    className="font-cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (English)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الفعالية</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">فعالية بارزة (2025)</p>
                      <p className="text-sm text-muted-foreground">عرض في قسم الفعاليات البارزة</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ترتيب العرض</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={!formData.title_ar}>
                  {editingEvent ? 'حفظ التعديلات' : 'إضافة فعالية'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="grid gap-4">
          {events?.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center text-muted-foreground">
              لا توجد فعاليات
            </Card>
          ) : (
            events?.map((event) => (
              <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {event.is_featured && (
                            <Star className="w-4 h-4 text-primary fill-primary" />
                          )}
                          <h3 className="font-bold text-lg">{language === 'ar' ? event.title_ar : event.title_en || event.title_ar}</h3>
                        </div>
                        {(event.description_ar || event.description_en) && (
                          <p className="text-muted-foreground text-sm mb-2">
                            {language === 'ar' ? event.description_ar : event.description_en || event.description_ar}
                          </p>
                        )}
                        {event.event_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.event_date), 'yyyy-MM-dd')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteEventId(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEventId && deleteMutation.mutate(deleteEventId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </HRLayout>
  );
}

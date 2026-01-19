import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Edit, Trash2, Crown, Users, Briefcase, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const roleLabels: Record<string, { ar: string; en: string; icon: LucideIcon }> = {
  president: { ar: 'رئيس الكيان', en: 'President', icon: Crown },
  coordinator: { ar: 'منسق', en: 'Coordinator', icon: Users },
  committee_head: { ar: 'رئيس لجنة', en: 'Committee Head', icon: Briefcase },
  committee_deputy: { ar: 'نائب رئيس لجنة', en: 'Committee Deputy', icon: User },
};

export default function StructureManagementPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name_ar: '',
    full_name_en: '',
    role: 'president' as 'president' | 'coordinator' | 'committee_head' | 'committee_deputy',
    committee_id: '',
    position_title_ar: '',
    position_title_en: '',
    bio_ar: '',
    bio_en: '',
    photo_url: '',
    email: '',
    phone: '',
    display_order: 0,
    is_active: true,
  });

  // Fetch committees
  const { data: committees } = useQuery({
    queryKey: ['committees'],
    queryFn: async () => {
      const { data } = await supabase.from('committees').select('*').eq('is_active', true);
      return data || [];
    },
  });

  // Fetch organizational structure
  const { data: structure, isLoading } = useQuery({
    queryKey: ['organizational-structure'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizational_structure')
        .select('*, committees:committee_id(id, name_ar, name_en)')
        .order('role')
        .order('display_order');
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('organizational_structure').insert({
        ...formData,
        committee_id: formData.role === 'committee_head' || formData.role === 'committee_deputy'
          ? formData.committee_id || null
          : null,
        created_by: user.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizational-structure'] });
      toast({ title: t('common', 'success'), description: 'تمت الإضافة بنجاح!' });
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
        .from('organizational_structure')
        .update({
          ...formData,
          committee_id: formData.role === 'committee_head' || formData.role === 'committee_deputy'
            ? formData.committee_id || null
            : null,
        })
        .eq('id', editingMember.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizational-structure'] });
      toast({ title: t('common', 'success'), description: 'تم التعديل بنجاح!' });
      setIsDialogOpen(false);
      setEditingMember(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('organizational_structure').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizational-structure'] });
      toast({ title: t('common', 'success'), description: 'تم الحذف بنجاح!' });
      setDeleteMemberId(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      full_name_ar: '',
      full_name_en: '',
      role: 'president',
      committee_id: '',
      position_title_ar: '',
      position_title_en: '',
      bio_ar: '',
      bio_en: '',
      photo_url: '',
      email: '',
      phone: '',
      display_order: 0,
      is_active: true,
    });
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      full_name_ar: member.full_name_ar || '',
      full_name_en: member.full_name_en || '',
      role: member.role,
      committee_id: member.committee_id || '',
      position_title_ar: member.position_title_ar || '',
      position_title_en: member.position_title_en || '',
      bio_ar: member.bio_ar || '',
      bio_en: member.bio_en || '',
      photo_url: member.photo_url || '',
      email: member.email || '',
      phone: member.phone || '',
      display_order: member.display_order || 0,
      is_active: member.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.full_name_ar) {
      toast({ title: t('common', 'error'), description: 'الاسم بالعربي مطلوب', variant: 'destructive' });
      return;
    }
    if (editingMember) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedStructure = structure?.reduce((acc: any, member: any) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {});

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
              إدارة الهيكل الإداري
            </h1>
            <p className="text-muted-foreground">تعديل وإضافة أعضاء الهيكل الإداري</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingMember(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                إضافة عضو
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMember ? 'تعديل عضو' : 'إضافة عضو جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم الكامل (عربي) *</Label>
                    <Input
                      value={formData.full_name_ar}
                      onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                      className="font-cairo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم الكامل (English)</Label>
                    <Input
                      value={formData.full_name_en}
                      onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الدور *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value, committee_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {language === 'ar' ? label.ar : label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.role === 'committee_head' || formData.role === 'committee_deputy') && (
                  <div className="space-y-2">
                    <Label>اللجنة *</Label>
                    <Select
                      value={formData.committee_id}
                      onValueChange={(value) => setFormData({ ...formData, committee_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اللجنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {committees?.map((committee) => (
                          <SelectItem key={committee.id} value={committee.id}>
                            {language === 'ar' ? committee.name_ar : committee.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المسمى الوظيفي (عربي)</Label>
                    <Input
                      value={formData.position_title_ar}
                      onChange={(e) => setFormData({ ...formData, position_title_ar: e.target.value })}
                      className="font-cairo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المسمى الوظيفي (English)</Label>
                    <Input
                      value={formData.position_title_en}
                      onChange={(e) => setFormData({ ...formData, position_title_en: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الهاتف</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>رابط الصورة</Label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نبذة (عربي)</Label>
                    <Textarea
                      value={formData.bio_ar}
                      onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                      rows={3}
                      className="font-cairo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نبذة (English)</Label>
                    <Textarea
                      value={formData.bio_en}
                      onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ترتيب العرض</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit}>
                  {editingMember ? 'حفظ التعديلات' : 'إضافة عضو'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Structure List */}
        <div className="space-y-6">
          {Object.entries(roleLabels).map(([roleKey, roleLabel]) => {
            const members = groupedStructure?.[roleKey] || [];
            if (members.length === 0) return null;

            const Icon = roleLabel.icon;
            return (
              <motion.div key={roleKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {language === 'ar' ? roleLabel.ar : roleLabel.en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((member: any) => (
                        <div key={member.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold">{language === 'ar' ? member.full_name_ar : member.full_name_en || member.full_name_ar}</h3>
                              {member.position_title_ar && (
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? member.position_title_ar : member.position_title_en || member.position_title_ar}
                                </p>
                              )}
                              {member.committees && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {language === 'ar' ? member.committees.name_ar : member.committees.name_en}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteMemberId(member.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا العضو من الهيكل الإداري؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMemberId && deleteMutation.mutate(deleteMemberId)}
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

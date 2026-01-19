import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CommitteesPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCommittee, setNewCommittee] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
  });

  // Edit state
  const [editingCommittee, setEditingCommittee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
  });

  // Delete state
  const [committeeToDelete, setCommitteeToDelete] = useState<any>(null);

  const { data: committees, isLoading } = useQuery({
    queryKey: ['committees-admin'],
    queryFn: async () => {
      const { data } = await supabase
        .from('committees')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: memberCounts } = useQuery({
    queryKey: ['committee-member-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('members')
        .select('committee_id')
        .eq('status', 'active');

      const counts: Record<string, number> = {};
      data?.forEach(m => {
        if (m.committee_id) {
          counts[m.committee_id] = (counts[m.committee_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const createCommitteeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('committees').insert(newCommittee);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees-admin'] });
      toast({ title: t('common', 'success') });
      setIsDialogOpen(false);
      setNewCommittee({ name_en: '', name_ar: '', description_en: '', description_ar: '' });
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('committees')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees-admin'] });
      toast({ title: t('common', 'success') });
    },
  });

  // Update committee mutation
  const updateCommitteeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('committees')
        .update({
          name_en: editForm.name_en,
          name_ar: editForm.name_ar,
          description_en: editForm.description_en,
          description_ar: editForm.description_ar,
        })
        .eq('id', editingCommittee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees-admin'] });
      toast({ title: t('common', 'success'), description: 'Committee updated!' });
      setIsEditDialogOpen(false);
      setEditingCommittee(null);
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  // Delete committee mutation
  const deleteCommitteeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('committees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees-admin'] });
      toast({ title: t('common', 'success'), description: 'Committee deleted!' });
      setCommitteeToDelete(null);
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  const handleEditCommittee = (committee: any) => {
    setEditingCommittee(committee);
    setEditForm({
      name_en: committee.name_en || '',
      name_ar: committee.name_ar || '',
      description_en: committee.description_en || '',
      description_ar: committee.description_ar || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('nav', 'committees')}
            </h1>
            <p className="text-muted-foreground">Manage organization committees</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Add Committee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Committee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name (English)</Label>
                    <Input
                      value={newCommittee.name_en}
                      onChange={(e) => setNewCommittee({ ...newCommittee, name_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (Arabic)</Label>
                    <Input
                      value={newCommittee.name_ar}
                      onChange={(e) => setNewCommittee({ ...newCommittee, name_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={newCommittee.description_en}
                    onChange={(e) => setNewCommittee({ ...newCommittee, description_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Arabic)</Label>
                  <Textarea
                    value={newCommittee.description_ar}
                    onChange={(e) => setNewCommittee({ ...newCommittee, description_ar: e.target.value })}
                    rows={2}
                    dir="rtl"
                  />
                </div>
                <Button className="w-full" onClick={() => createCommitteeMutation.mutate()}>
                  Create Committee
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <Card className="bg-card border-border p-8 text-center col-span-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </Card>
          ) : committees?.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center col-span-full text-muted-foreground">
              {t('common', 'noData')}
            </Card>
          ) : (
            committees?.map((committee) => (
              <motion.div
                key={committee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-card border-border hover:border-primary/50 transition-colors ${!committee.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={() => handleEditCommittee(committee)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common', 'edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleActiveMutation.mutate({ id: committee.id, isActive: committee.is_active })}
                          >
                            {committee.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCommitteeToDelete(committee)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      {language === 'ar' ? committee.name_ar : committee.name_en}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {language === 'ar' ? committee.description_ar : committee.description_en}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{memberCounts?.[committee.id] || 0} members</span>
                      </div>
                      <Badge variant="outline" className={
                        committee.is_active
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }>
                        {committee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit Committee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Committee</DialogTitle>
              <DialogDescription>
                Update committee details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input
                    value={editForm.name_en}
                    onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input
                    value={editForm.name_ar}
                    onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={editForm.description_en}
                  onChange={(e) => setEditForm({ ...editForm, description_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Arabic)</Label>
                <Textarea
                  value={editForm.description_ar}
                  onChange={(e) => setEditForm({ ...editForm, description_ar: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => updateCommitteeMutation.mutate()}
                disabled={updateCommitteeMutation.isPending}
              >
                {updateCommitteeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!committeeToDelete} onOpenChange={(open) => !open && setCommitteeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Committee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{language === 'ar' ? committeeToDelete?.name_ar : committeeToDelete?.name_en}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => committeeToDelete && deleteCommitteeMutation.mutate(committeeToDelete.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </HRLayout>
  );
}

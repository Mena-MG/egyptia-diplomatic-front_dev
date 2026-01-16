import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function EvaluationsPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [evaluation, setEvaluation] = useState({
    attendance: 5,
    taskExecution: 5,
    teamwork: 5,
    initiative: 5,
    compliance: 5,
    notes: '',
  });

  const { data: members } = useQuery({
    queryKey: ['members-list'],
    queryFn: async () => {
      const { data } = await supabase.from('members').select('id, full_name').eq('status', 'active');
      return data || [];
    },
  });

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('monthly_evaluations')
        .select('*, member:member_id(full_name)')
        .order('evaluation_month', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('monthly_evaluations').insert({
        member_id: selectedMember,
        evaluation_month: `${selectedMonth}-01`,
        attendance_commitment: evaluation.attendance,
        task_execution: evaluation.taskExecution,
        team_collaboration: evaluation.teamwork,
        initiative_growth: evaluation.initiative,
        policy_compliance: evaluation.compliance,
        evaluator_notes: evaluation.notes,
        is_submitted: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast({ title: t('common', 'success') });
      setIsDialogOpen(false);
      setEvaluation({ attendance: 5, taskExecution: 5, teamwork: 5, initiative: 5, compliance: 5, notes: '' });
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  const totalScore = evaluation.attendance + evaluation.taskExecution + evaluation.teamwork + evaluation.initiative + evaluation.compliance;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('evaluations', 'title')}
            </h1>
            <p className="text-muted-foreground">{t('evaluations', 'subtitle')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('evaluations', 'createEvaluation')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('evaluations', 'createEvaluation')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('evaluations', 'selectMember')}</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <User className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t('evaluations', 'selectMember')} />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('evaluations', 'selectMonth')}</Label>
                    <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                  </div>
                </div>

                {/* Criteria */}
                {[
                  { key: 'attendance', label: t('evaluations', 'attendanceCommitment') },
                  { key: 'taskExecution', label: t('evaluations', 'taskExecution') },
                  { key: 'teamwork', label: t('evaluations', 'teamCollaboration') },
                  { key: 'initiative', label: t('evaluations', 'initiativeGrowth') },
                  { key: 'compliance', label: t('evaluations', 'policyCompliance') },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{label}</Label>
                      <span className="text-sm text-primary font-medium">
                        {evaluation[key as keyof typeof evaluation]}/10
                      </span>
                    </div>
                    <Slider
                      value={[evaluation[key as keyof typeof evaluation] as number]}
                      onValueChange={([v]) => setEvaluation({ ...evaluation, [key]: v })}
                      max={10}
                      step={1}
                    />
                  </div>
                ))}

                <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                  <span className="font-medium">{t('evaluations', 'totalOutOf50')}</span>
                  <span className="text-2xl font-bold text-primary">{totalScore}/50</span>
                </div>

                <div className="space-y-2">
                  <Label>{t('evaluations', 'evaluatorNotes')}</Label>
                  <Textarea
                    value={evaluation.notes}
                    onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button className="w-full" onClick={() => createEvaluationMutation.mutate()}>
                  {t('common', 'submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Evaluations List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="bg-card border-border p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </Card>
          ) : evaluations?.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center text-muted-foreground">
              {t('common', 'noData')}
            </Card>
          ) : (
            evaluations?.map((ev) => (
              <motion.div key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{ev.member?.full_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(ev.evaluation_month), 'MMMM yyyy', { locale: language === 'ar' ? ar : undefined })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{ev.total_score}/50</p>
                        <p className="text-sm text-muted-foreground">
                          {ev.is_submitted ? 'Submitted' : 'Draft'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </HRLayout>
  );
}

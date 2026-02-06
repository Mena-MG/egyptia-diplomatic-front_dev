import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

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

  // Fetch applicants for evaluation selection (people who submitted applications from landing page)
  const { data: applicants, isLoading: loadingApplicants } = useQuery({
    queryKey: ['applicants-for-evaluation'],
    queryFn: async () => {
      const { data: applicantsData } = await supabase
        .from('applicants')
        .select('id, full_name')
        .order('full_name');

      return applicantsData || [];
    },
  });

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('monthly_evaluations')
        .select('*, applicant:applicant_id(full_name)')
        .order('evaluation_month', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('monthly_evaluations').insert({
        applicant_id: selectedMember,
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
                        {loadingApplicants ? (
                          <SelectItem value="loading" disabled>Loading applicants...</SelectItem>
                        ) : !applicants || applicants.length === 0 ? (
                          <SelectItem value="no-applicants" disabled>No applicants available</SelectItem>
                        ) : (
                          applicants.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('evaluations', 'selectMonth')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {format(new Date(`${selectedMonth}-01`), 'MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const currentDate = new Date(`${selectedMonth}-01`);
                                const newDate = subMonths(currentDate, 1);
                                setSelectedMonth(format(newDate, 'yyyy-MM'));
                              }}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-medium">
                              {format(new Date(`${selectedMonth}-01`), 'yyyy', { locale: language === 'ar' ? ar : enUS })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const currentDate = new Date(`${selectedMonth}-01`);
                                const newDate = addMonths(currentDate, 1);
                                setSelectedMonth(format(newDate, 'yyyy-MM'));
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }, (_, i) => {
                              const currentYear = selectedMonth.split('-')[0];
                              const monthValue = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
                              const isSelected = monthValue === selectedMonth;
                              return (
                                <Button
                                  key={i}
                                  variant={isSelected ? 'default' : 'ghost'}
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setSelectedMonth(monthValue)}
                                >
                                  {format(new Date(2024, i, 1), 'MMM', { locale: language === 'ar' ? ar : enUS })}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
                          <h3 className="font-medium">{(ev as any).applicant?.full_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
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

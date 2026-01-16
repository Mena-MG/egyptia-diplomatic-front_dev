import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Clock,
  MapPin,
  Video,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  no_show: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  rescheduled: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export default function InterviewsPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

  // Evaluation form state
  const [evaluation, setEvaluation] = useState({
    communication: 5,
    motivation: 5,
    skills: 5,
    cultureFit: 5,
    overall: 5,
    notes: '',
    recommendation: '',
  });

  // Fetch interviews
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        // @ts-ignore
        .from('interviews')
        .select(`
          *,
          applicant:applicant_id(id, full_name, email, phone)
        `)
        .order('scheduled_at', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Update interview mutation
  const updateInterviewMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        // @ts-ignore
        .from('interviews')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: t('common', 'success') });
      setIsEvaluationOpen(false);
    },
  });

  const handleSaveEvaluation = (isDraft: boolean) => {
    if (!selectedInterview) return;

    const totalScoreValue = evaluation.communication + evaluation.motivation + evaluation.skills + evaluation.cultureFit + evaluation.overall;

    updateInterviewMutation.mutate({
      id: selectedInterview.id,
      updates: {
        score_communication: evaluation.communication,
        score_motivation: evaluation.motivation,
        score_skills: evaluation.skills,
        score_culture_fit: evaluation.cultureFit,
        score_overall: evaluation.overall,
        total_score: totalScoreValue,
        notes: evaluation.notes,
        recommendation: evaluation.recommendation || null,
        is_draft: isDraft,
        status: isDraft ? 'scheduled' : 'completed',
      },
    });
  };

  // Reset evaluation when selecting a different interview
  const openEvaluationDialog = (interview: any) => {
    setSelectedInterview(interview);
    setEvaluation({
      communication: interview.score_communication ?? 5,
      motivation: interview.score_motivation ?? 5,
      skills: interview.score_skills ?? 5,
      cultureFit: interview.score_culture_fit ?? 5,
      overall: interview.score_overall ?? 5,
      notes: interview.notes ?? '',
      recommendation: interview.recommendation ?? '',
    });
    setIsEvaluationOpen(true);
  };

  const generateWhatsAppMessage = (interview: any) => {
    const date = format(new Date(interview.scheduled_at), 'EEEE, MMMM d, yyyy', { locale: language === 'ar' ? ar : undefined });
    const time = format(new Date(interview.scheduled_at), 'h:mm a', { locale: language === 'ar' ? ar : undefined });

    const message = language === 'ar'
      ? `مرحباً ${interview.applicant?.full_name}،\n\nيسعدنا إبلاغكم بموعد المقابلة الشخصية:\n\n📅 التاريخ: ${date}\n⏰ الوقت: ${time}\n📍 المكان: ${interview.location || 'سيتم تحديده'}\n${interview.meeting_link ? `🔗 رابط الاجتماع: ${interview.meeting_link}` : ''}\n\nنتطلع للقائكم!\n\nالجبهة الدبلوماسية المصرية`
      : `Dear ${interview.applicant?.full_name},\n\nWe are pleased to inform you of your interview appointment:\n\n📅 Date: ${date}\n⏰ Time: ${time}\n📍 Location: ${interview.location || 'TBD'}\n${interview.meeting_link ? `🔗 Meeting Link: ${interview.meeting_link}` : ''}\n\nWe look forward to meeting you!\n\nEgyptian Diplomatic Front`;

    navigator.clipboard.writeText(message);
    toast({ title: t('common', 'success'), description: 'Message copied to clipboard!' });
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterviewsForDay = (day: Date) => {
    return interviews?.filter((i) => isSameDay(new Date(i.scheduled_at), day)) || [];
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy h:mm a', { locale: language === 'ar' ? ar : undefined });
  };

  const totalScore = evaluation.communication + evaluation.motivation + evaluation.skills + evaluation.cultureFit + evaluation.overall;

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('interviews', 'title')}
            </h1>
            <p className="text-muted-foreground">
              {t('interviews', 'subtitle')}
            </p>
          </div>
          <Button>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('interviews', 'scheduleNew')}
          </Button>
        </div>

        {/* View Toggle & Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
                  <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                      <List className="w-4 h-4" />
                      {t('interviews', 'listView')}
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {t('interviews', 'calendarView')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={t('common', 'search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-48 ${isRTL ? 'pr-9' : 'pl-9'} bg-muted/50`}
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">{t('interviewStatus', 'scheduled')}</SelectItem>
                    <SelectItem value="completed">{t('interviewStatus', 'completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('interviewStatus', 'cancelled')}</SelectItem>
                    <SelectItem value="no_show">{t('interviewStatus', 'no_show')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List View */}
        {view === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {isLoading ? (
              <Card className="bg-card border-border p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </Card>
            ) : interviews?.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                {t('common', 'noData')}
              </Card>
            ) : (
              interviews?.map((interview) => (
                <Card key={interview.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{interview.applicant?.full_name || 'Unknown'}</h3>
                          <p className="text-sm text-muted-foreground">{interview.applicant?.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {formatDate(interview.scheduled_at)}
                            </span>
                            {interview.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {interview.location}
                              </span>
                            )}
                            {interview.meeting_link && (
                              <span className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                Online
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={statusColors[interview.status] || ''}>
                          {t('interviewStatus', interview.status)}
                        </Badge>

                        {interview.total_score !== null && (
                          <span className="text-sm font-medium">
                            {interview.total_score}/50
                          </span>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem onClick={() => openEvaluationDialog(interview)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('interviews', 'evaluationForm')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateWhatsAppMessage(interview)}>
                              <Copy className="w-4 h-4 mr-2" />
                              {t('interviews', 'generateMessage')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {format(currentMonth, 'MMMM yyyy', { locale: language === 'ar' ? ar : undefined })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for alignment */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                  ))}

                  {/* Calendar Days */}
                  {days.map((day) => {
                    const dayInterviews = getInterviewsForDay(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[100px] p-2 border border-border rounded-lg ${isToday ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                          }`}
                      >
                        <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayInterviews.slice(0, 2).map((interview) => (
                            <div
                              key={interview.id}
                              className="text-xs p-1 bg-primary/10 rounded truncate cursor-pointer hover:bg-primary/20"
                              onClick={() => openEvaluationDialog(interview)}
                            >
                              {format(new Date(interview.scheduled_at), 'h:mm a')} - {interview.applicant?.full_name}
                            </div>
                          ))}
                          {dayInterviews.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayInterviews.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Evaluation Dialog */}
        <Dialog open={isEvaluationOpen} onOpenChange={setIsEvaluationOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('interviews', 'evaluationForm')}</DialogTitle>
            </DialogHeader>

            {selectedInterview && (
              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedInterview.applicant?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedInterview.applicant?.email}</p>
                  </div>
                </div>

                {/* Scoring Criteria */}
                <div className="space-y-4">
                  {[
                    { key: 'communication', label: t('interviews', 'communication') },
                    { key: 'motivation', label: t('interviews', 'motivation') },
                    { key: 'skills', label: t('interviews', 'relevantSkills') },
                    { key: 'cultureFit', label: t('interviews', 'cultureFit') },
                    { key: 'overall', label: t('interviews', 'overallScore') },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{label}</Label>
                        <span className="text-sm font-medium text-primary">
                          {evaluation[key as keyof typeof evaluation]}/10
                        </span>
                      </div>
                      <Slider
                        value={[evaluation[key as keyof typeof evaluation] as number]}
                        onValueChange={([value]) => setEvaluation({ ...evaluation, [key]: value })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Total Score */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <span className="font-medium">{t('interviews', 'totalScore')}</span>
                  <span className="text-2xl font-bold text-primary">
                    {totalScore}/50
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>{t('interviews', 'notes')}</Label>
                  <Textarea
                    value={evaluation.notes}
                    onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                    placeholder="Add evaluation notes..."
                    rows={4}
                  />
                </div>

                {/* Recommendation */}
                <div className="space-y-2">
                  <Label>{t('interviews', 'recommendation')}</Label>
                  <Select
                    value={evaluation.recommendation}
                    onValueChange={(v) => setEvaluation({ ...evaluation, recommendation: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recommendation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accept">{t('applications', 'accept')}</SelectItem>
                      <SelectItem value="reject">{t('applications', 'reject')}</SelectItem>
                      <SelectItem value="waitlist">{t('applications', 'waitlist')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => handleSaveEvaluation(true)}>
                    {t('interviews', 'saveAsDraft')}
                  </Button>
                  <Button onClick={() => handleSaveEvaluation(false)}>
                    {t('interviews', 'submitFinal')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}

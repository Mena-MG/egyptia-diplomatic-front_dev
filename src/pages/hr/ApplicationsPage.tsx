import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const PAGE_SIZES = [10, 25, 50, 100];

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  screening: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  interview_scheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  interview_completed: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  waitlist: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  onboarding: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  withdrawn: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function ApplicationsPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch committees for filter
  const { data: committees } = useQuery({
    queryKey: ['committees'],
    queryFn: async () => {
      const { data } = await supabase.from('committees').select('*').eq('is_active', true);
      return data || [];
    },
  });

  // Fetch applications with pagination
  const { data: applicationsData, isLoading, refetch } = useQuery({
    queryKey: ['applications', searchQuery, statusFilter, committeeFilter, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('applicants')
        .select('*, committees:committee_preference(name_en, name_ar)', { count: 'exact' });

      // Apply search filter
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'new' | 'screening' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'waitlist' | 'onboarding' | 'withdrawn');
      }

      // Apply committee filter
      if (committeeFilter !== 'all') {
        query = query.eq('committee_preference', committeeFilter);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return { applications: data || [], total: count || 0 };
    },
  });

  type ApplicantStatus = 'new' | 'screening' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'waitlist' | 'onboarding' | 'withdrawn';

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicantStatus }) => {
      const { error } = await supabase
        .from('applicants')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({ title: t('common', 'success'), description: 'Status updated successfully' });
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  const applications = applicationsData?.applications || [];
  const totalCount = applicationsData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy', { locale: language === 'ar' ? ar : undefined });
  };

  const getCommitteeName = (committee: { name_en: string; name_ar: string } | null) => {
    if (!committee) return '-';
    return language === 'ar' ? committee.name_ar : committee.name_en;
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('applications', 'title')}
            </h1>
            <p className="text-muted-foreground">
              {t('applications', 'subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('applications', 'exportCSV')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('applications', 'searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className={`${isRTL ? 'pr-9' : 'pl-9'} bg-muted/50`}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('applications', 'filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applications', 'allStatuses')}</SelectItem>
                  <SelectItem value="new">{t('applicationStatus', 'new')}</SelectItem>
                  <SelectItem value="screening">{t('applicationStatus', 'screening')}</SelectItem>
                  <SelectItem value="interview_scheduled">{t('applicationStatus', 'interview_scheduled')}</SelectItem>
                  <SelectItem value="interview_completed">{t('applicationStatus', 'interview_completed')}</SelectItem>
                  <SelectItem value="accepted">{t('applicationStatus', 'accepted')}</SelectItem>
                  <SelectItem value="rejected">{t('applicationStatus', 'rejected')}</SelectItem>
                  <SelectItem value="waitlist">{t('applicationStatus', 'waitlist')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Committee Filter */}
              <Select value={committeeFilter} onValueChange={(v) => { setCommitteeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('applications', 'filterByCommittee')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applications', 'allCommittees')}</SelectItem>
                  {committees?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {language === 'ar' ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">{t('applications', 'applicantName')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('applications', 'dateSubmitted')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('applications', 'committee')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('common', 'status')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('common', 'actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {t('common', 'noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {app.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{app.full_name}</p>
                              <p className="text-sm text-muted-foreground">{app.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(app.created_at)}
                        </TableCell>
                        <TableCell>
                          {getCommitteeName(app.committees as { name_en: string; name_ar: string } | null)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[app.status] || ''}>
                            {t('applicationStatus', app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/hr/applications/${app.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem asChild>
                                  <Link to={`/hr/applications/${app.id}`}>
                                    {t('applications', 'viewDetails')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'screening' })}
                                >
                                  {t('applications', 'moveToScreening')}
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/hr/interviews/new?applicant=${app.id}`}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {t('applications', 'scheduleInterview')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'accepted' })}
                                  className="text-green-500"
                                >
                                  {t('applications', 'accept')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'waitlist' })}
                                  className="text-orange-500"
                                >
                                  {t('applications', 'waitlist')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                                  className="text-red-500"
                                >
                                  {t('applications', 'reject')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('applications', 'showingResults')}</span>
                <span className="font-medium text-foreground">
                  {Math.min((page - 1) * pageSize + 1, totalCount)}-{Math.min(page * pageSize, totalCount)}
                </span>
                <span>{t('applications', 'of')}</span>
                <span className="font-medium text-foreground">{totalCount}</span>
                <span>{t('applications', 'results')}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Page Size */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('applications', 'perPage')}</span>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <span className="px-3 text-sm">
                    {page} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </HRLayout>
  );
}

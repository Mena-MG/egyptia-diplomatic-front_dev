import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  on_leave: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  offboarded: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function MembersPage() {
  const { t, language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members', searchQuery, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*, committee:committee_id(name_en, name_ar)', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'active' | 'inactive' | 'suspended' | 'on_leave' | 'offboarded');
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;
      return { members: data || [], total: count || 0 };
    },
  });

  const members = membersData?.members || [];
  const totalCount = membersData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('members', 'title')}
            </h1>
            <p className="text-muted-foreground">{t('members', 'subtitle')}</p>
          </div>
          <Button>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('members', 'addMember')}
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('common', 'search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-9' : 'pl-9'} bg-muted/50`}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">{t('memberStatus', 'active')}</SelectItem>
                  <SelectItem value="inactive">{t('memberStatus', 'inactive')}</SelectItem>
                  <SelectItem value="suspended">{t('memberStatus', 'suspended')}</SelectItem>
                  <SelectItem value="on_leave">{t('memberStatus', 'on_leave')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>{t('common', 'name')}</TableHead>
                  <TableHead>{t('members', 'committeeRole')}</TableHead>
                  <TableHead>{t('members', 'joinDate')}</TableHead>
                  <TableHead>{t('common', 'status')}</TableHead>
                  <TableHead>{t('common', 'actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {t('common', 'noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{language === 'ar' ? member.committee?.name_ar : member.committee?.name_en}</p>
                          <p className="text-sm text-muted-foreground">{member.role_title || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.join_date), 'MMM dd, yyyy', { locale: language === 'ar' ? ar : undefined })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[member.status] || ''}>
                          {t('memberStatus', member.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem>{t('members', 'viewProfile')}</DropdownMenuItem>
                            <DropdownMenuItem>{t('common', 'edit')}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {t('applications', 'showingResults')} {Math.min((page - 1) * pageSize + 1, totalCount)}-{Math.min(page * pageSize, totalCount)} {t('applications', 'of')} {totalCount}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </HRLayout>
  );
}

import { motion } from 'framer-motion';
import { 
  Users2, 
  Lightbulb, 
  Calendar, 
  CheckCircle2, 
  TrendingUp,
  Download,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data for charts
const statusData = [
  { name: 'Under Review', value: 25, color: '#D4A853' },
  { name: 'New', value: 20, color: '#3B82F6' },
  { name: 'Hired', value: 25, color: '#22C55E' },
  { name: 'Rejected', value: 30, color: '#EF4444' },
];

const activityData = [
  { month: 'Jan', value: 80 },
  { month: 'Feb', value: 90 },
  { month: 'Mar', value: 100 },
  { month: 'Apr', value: 95 },
  { month: 'May', value: 120 },
  { month: 'Jun', value: 180 },
];

const upcomingInterviews = [
  { id: 1, name: 'Youssef Ali', position: 'Cultural Attaché', time: '10:00 AM', date: 'OCT 24' },
  { id: 2, name: 'Sarah Moamen', position: 'Youth Ambassador', time: '01:30 PM', date: 'OCT 24' },
  { id: 3, name: 'Karim Abdelrahman', position: 'Policy Analyst', time: '09:00 AM', date: 'OCT 25' },
];

const recentEvaluations = [
  { id: 1, name: 'Khaled M.', position: 'Policy Analyst', score: 92, status: 'hired' },
  { id: 2, name: 'Fatima E.', position: 'Youth Amb.', score: null, status: 'pending' },
  { id: 3, name: 'Nour I.', position: 'Comm. Officer', score: 68, status: 'rejected' },
];

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  iconBg = 'bg-muted',
  trend,
  target,
  delay = 0 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  target?: { current: number; max: number };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
                  {trend.value}
                </p>
              )}
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              {target && (
                <div className="mt-2">
                  <p className="text-xs text-green-500 mb-1">Target: {target.max}</p>
                  <Progress value={(target.current / target.max) * 100} className="h-1.5" />
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HRDashboard() {
  const { t, isRTL } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [applicantsRes, interviewsRes] = await Promise.all([
        supabase.from('applicants').select('status', { count: 'exact' }),
        supabase.from('interviews').select('status', { count: 'exact' }),
      ]);

      const applicants = applicantsRes.data || [];
      const interviews = interviewsRes.data || [];

      return {
        totalApplicants: applicants.length || 1248,
        newApplications: applicants.filter(a => a.status === 'new').length || 45,
        interviewsScheduled: interviews.filter(i => i.status === 'scheduled').length || 18,
        hiredThisYear: applicants.filter(a => a.status === 'accepted').length || 156,
      };
    },
  });

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('dashboard', 'hrOverview')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard', 'welcomeMessage')}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('dashboard', 'exportReport')}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('dashboard', 'totalApplicants')}
            value={stats?.totalApplicants?.toLocaleString() || '1,248'}
            trend={{ value: '+12% since last month', positive: true }}
            icon={Users2}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-400"
            delay={0.1}
          />
          <StatCard
            title={t('dashboard', 'newApplications')}
            value={stats?.newApplications || 45}
            trend={{ value: '+5% since last week', positive: true }}
            icon={Lightbulb}
            iconBg="bg-yellow-500/10"
            iconColor="text-yellow-400"
            delay={0.2}
          />
          <StatCard
            title={t('dashboard', 'interviewsScheduled')}
            value={stats?.interviewsScheduled || 18}
            subtitle="For the next 7 days"
            icon={Calendar}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
            delay={0.3}
          />
          <StatCard
            title={t('dashboard', 'hiredThisYear')}
            value={stats?.hiredThisYear || 156}
            target={{ current: 156, max: 200 }}
            icon={CheckCircle2}
            iconBg="bg-green-500/10"
            iconColor="text-green-400"
            delay={0.4}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Applicants by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {t('dashboard', 'applicantsByStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">1.2k</span>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart - Recruitment Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t('dashboard', 'recruitmentActivity')}
                </CardTitle>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(220, 20%, 10%)',
                          border: '1px solid hsl(43, 30%, 25%)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(43, 74%, 52%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Interviews & Evaluations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t('dashboard', 'upcomingInterviews')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" asChild>
                  <Link to="/hr/interviews">{t('common', 'viewAll')}</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                      <span className="text-[10px] font-medium">
                        {interview.date.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {interview.date.split(' ')[1]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{interview.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {interview.position} • {interview.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Evaluations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t('dashboard', 'recentEvaluations')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" asChild>
                  <Link to="/hr/evaluations">{t('common', 'viewAll')}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {/* Header Row */}
                  <div className="grid grid-cols-3 gap-4 px-3 py-2 text-xs text-muted-foreground uppercase">
                    <span>{t('common', 'candidate')}</span>
                    <span className="text-center">{t('common', 'score')}</span>
                    <span className={isRTL ? 'text-left' : 'text-right'}>{t('common', 'status')}</span>
                  </div>
                  
                  {recentEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {evaluation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{evaluation.name}</p>
                          <p className="text-xs text-muted-foreground">{evaluation.position}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-medium ${
                          evaluation.score && evaluation.score >= 70 
                            ? 'text-green-500' 
                            : evaluation.score 
                              ? 'text-red-500' 
                              : 'text-muted-foreground'
                        }`}>
                          {evaluation.score ? `${evaluation.score}/100` : '--/100'}
                        </span>
                      </div>
                      <div className={isRTL ? 'text-left' : 'text-right'}>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          evaluation.status === 'hired' 
                            ? 'bg-green-500/10 text-green-500' 
                            : evaluation.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                        }`}>
                          {evaluation.status === 'hired' ? t('common', 'hired') :
                           evaluation.status === 'pending' ? t('common', 'pending') :
                           t('common', 'rejected')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </HRLayout>
  );
}
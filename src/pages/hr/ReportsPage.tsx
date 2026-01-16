import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Users, 
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ReportsPage() {
  const { t, isRTL } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const [applicantsRes, membersRes, interviewsRes] = await Promise.all([
        supabase.from('applicants').select('status'),
        supabase.from('members').select('status'),
        supabase.from('interviews').select('status, total_score'),
      ]);

      const applicants = applicantsRes.data || [];
      const members = membersRes.data || [];
      const interviews = interviewsRes.data || [];

      const completedInterviews = interviews.filter(i => i.total_score !== null);
      const avgScore = completedInterviews.length > 0
        ? Math.round(completedInterviews.reduce((acc, i) => acc + (i.total_score || 0), 0) / completedInterviews.length)
        : 0;

      return {
        totalApplications: applicants.length,
        newApplications: applicants.filter(a => a.status === 'new').length,
        interviewsCompleted: applicants.filter(a => a.status === 'interview_completed').length,
        accepted: applicants.filter(a => a.status === 'accepted').length,
        rejected: applicants.filter(a => a.status === 'rejected').length,
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        avgInterviewScore: avgScore,
        conversionRate: applicants.length > 0 
          ? Math.round((applicants.filter(a => a.status === 'accepted').length / applicants.length) * 100)
          : 0,
      };
    },
  });

  const reports = [
    {
      title: 'Application Funnel Report',
      description: 'View conversion rates from application to acceptance',
      icon: TrendingUp,
    },
    {
      title: 'Monthly Evaluation Rankings',
      description: 'Top and bottom performers by evaluation score',
      icon: BarChart3,
    },
    {
      title: 'Member Activity Report',
      description: 'Attendance rates and activity status',
      icon: Users,
    },
    {
      title: 'Committee Performance',
      description: 'Performance breakdown by committee',
      icon: PieChart,
    },
  ];

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('nav', 'reports')}
            </h1>
            <p className="text-muted-foreground">View and export HR analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              Export CSV
            </Button>
            <Button variant="outline">
              <FileText className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold text-foreground">{stats?.totalApplications || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-3xl font-bold text-green-500">{stats?.accepted || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold text-primary">{stats?.conversionRate || 0}%</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg Interview Score</p>
              <p className="text-3xl font-bold text-foreground">{stats?.avgInterviewScore || 0}/50</p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Total Applications', value: stats?.totalApplications || 0, color: 'bg-blue-500' },
                { label: 'Interviews Completed', value: stats?.interviewsCompleted || 0, color: 'bg-purple-500' },
                { label: 'Accepted', value: stats?.accepted || 0, color: 'bg-green-500' },
                { label: 'Rejected', value: stats?.rejected || 0, color: 'bg-red-500' },
              ].map((item, index) => {
                const maxValue = stats?.totalApplications || 1;
                const percentage = (item.value / maxValue) * 100;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </HRLayout>
  );
}

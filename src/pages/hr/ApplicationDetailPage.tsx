import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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

type ApplicantStatus = 'new' | 'screening' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'waitlist' | 'onboarding' | 'withdrawn';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applicant details
  const { data: applicant, isLoading } = useQuery({
    queryKey: ['applicant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applicants')
        .select('*, committees:committee_preference(id, name_en, name_ar)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch interviews for this applicant
  const { data: interviews } = useQuery({
    queryKey: ['applicant-interviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('applicant_id', id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: ApplicantStatus) => {
      const { error } = await supabase
        .from('applicants')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant', id] });
      toast({ title: t('common', 'success'), description: 'Status updated successfully' });
    },
    onError: () => {
      toast({ title: t('common', 'error'), variant: 'destructive' });
    },
  });

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy', { locale: language === 'ar' ? ar : undefined });
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy h:mm a', { locale: language === 'ar' ? ar : undefined });
  };

  if (isLoading) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </HRLayout>
    );
  }

  if (!applicant) {
    return (
      <HRLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Applicant Not Found</h2>
          <p className="text-muted-foreground mb-4">The applicant you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/hr/applications">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
        </div>
      </HRLayout>
    );
  }

  const committee = applicant.committees as { id: string; name_en: string; name_ar: string } | null;

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-playfair font-bold text-foreground">
                {applicant.full_name}
              </h1>
              <p className="text-muted-foreground">
                {applicant.reference_number || 'No reference number'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`text-sm ${statusColors[applicant.status] || ''}`}>
              {t('applicationStatus', applicant.status)}
            </Badge>
            <Button asChild>
              <Link to={`/hr/interviews/new?applicant=${applicant.id}`}>
                <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Schedule Interview
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{applicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{applicant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {applicant.city ? `${applicant.city}, ` : ''}{applicant.governorate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{applicant.age} years old</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education & Experience */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Education</p>
                  <p className="font-medium">{applicant.education}</p>
                </div>
                {applicant.experience && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Experience</p>
                    <p className="whitespace-pre-wrap">{applicant.experience}</p>
                  </div>
                )}
                {applicant.skills && applicant.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Motivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{applicant.motivation}</p>
              </CardContent>
            </Card>

            {/* Interviews */}
            {interviews && interviews.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Interviews ({interviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{formatDateTime(interview.scheduled_at)}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.location || 'No location'} • {interview.duration_minutes} min
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {interview.total_score !== null && (
                          <span className="text-sm font-medium">
                            Score: {interview.total_score}/50
                          </span>
                        )}
                        <Badge variant="outline" className={statusColors[interview.status] || ''}>
                          {t('interviewStatus', interview.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate('screening')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Move to Screening
                </Button>
                <Button
                  className="w-full justify-start text-green-500 hover:text-green-600"
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate('accepted')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  className="w-full justify-start text-orange-500 hover:text-orange-600"
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate('waitlist')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Add to Waitlist
                </Button>
                <Button
                  className="w-full justify-start text-red-500 hover:text-red-600"
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate('rejected')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                  <p className="font-medium">{formatDate(applicant.created_at)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Committee Preference</p>
                  <p className="font-medium">
                    {committee
                      ? (language === 'ar' ? committee.name_ar : committee.name_en)
                      : 'Not specified'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">{applicant.availability || 'Not specified'}</p>
                </div>
                {applicant.screening_score !== null && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Screening Score</p>
                      <p className="font-medium">{applicant.screening_score}/100</p>
                    </div>
                  </>
                )}
                {applicant.screening_notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Screening Notes</p>
                      <p className="text-sm">{applicant.screening_notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </HRLayout>
  );
}

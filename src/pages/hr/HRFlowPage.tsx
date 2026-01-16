import { motion } from 'framer-motion';
import { 
  GitBranch, 
  FileText, 
  Calendar, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { Link } from 'react-router-dom';

const flowSteps = [
  {
    id: 1,
    title: 'Recruitment',
    titleAr: 'التوظيف',
    description: 'Post openings and attract candidates',
    icon: FileText,
    link: '/hr/applications',
  },
  {
    id: 2,
    title: 'Application Intake',
    titleAr: 'استلام الطلبات',
    description: 'Collect and organize applications',
    icon: FileText,
    link: '/hr/applications',
  },
  {
    id: 3,
    title: 'Screening',
    titleAr: 'الفحص',
    description: 'Review and filter candidates',
    icon: FileText,
    link: '/hr/applications',
  },
  {
    id: 4,
    title: 'Interview Scheduling',
    titleAr: 'جدولة المقابلات',
    description: 'Schedule interviews with candidates',
    icon: Calendar,
    link: '/hr/interviews',
  },
  {
    id: 5,
    title: 'Interview & Scoring',
    titleAr: 'المقابلة والتقييم',
    description: 'Conduct interviews and evaluate',
    icon: Star,
    link: '/hr/interviews',
  },
  {
    id: 6,
    title: 'Final Decision',
    titleAr: 'القرار النهائي',
    description: 'Accept, Reject, or Waitlist',
    icon: CheckCircle,
    link: '/hr/applications',
  },
  {
    id: 7,
    title: 'Onboarding',
    titleAr: 'التأهيل',
    description: 'Welcome and integrate new members',
    icon: Users,
    link: '/hr/members',
  },
  {
    id: 8,
    title: 'Monthly Evaluation',
    titleAr: 'التقييم الشهري',
    description: 'Regular performance reviews',
    icon: Star,
    link: '/hr/evaluations',
  },
];

export default function HRFlowPage() {
  const { t, language, isRTL } = useLanguage();

  return (
    <HRLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-foreground">
            {t('nav', 'hrFlow')}
          </h1>
          <p className="text-muted-foreground">Complete HR workflow visualization</p>
        </div>

        {/* Flow Diagram */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              HR Process Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Flow Steps */}
              <div className="grid gap-4">
                {flowSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Step Number */}
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                          {step.id}
                        </div>

                        {/* Step Content */}
                        <Card className="flex-1 bg-muted/30 border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {language === 'ar' ? step.titleAr : step.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={step.link}>
                                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Connector */}
                        {index < flowSteps.length - 1 && (
                          <div className="absolute left-5 w-0.5 h-4 bg-primary/30" style={{ top: `${(index + 1) * 76}px` }} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4" asChild>
            <Link to="/hr/applications">
              <FileText className="w-5 h-5 mr-2" />
              Go to Applications
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4" asChild>
            <Link to="/hr/interviews">
              <Calendar className="w-5 h-5 mr-2" />
              Go to Interviews
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4" asChild>
            <Link to="/hr/members">
              <Users className="w-5 h-5 mr-2" />
              Go to Members
            </Link>
          </Button>
        </div>
      </div>
    </HRLayout>
  );
}

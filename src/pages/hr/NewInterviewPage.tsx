import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, User, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  applicant_id: z.string().min(1, 'Applicant is required'),
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().min(1, 'Time is required'),
  duration_minutes: z.number().min(15).max(180),
  location: z.string().max(255).optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function NewInterviewPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedApplicant = searchParams.get('applicant');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicant_id: preselectedApplicant || '',
      duration_minutes: 30,
      location: '',
      meeting_link: '',
      notes: '',
    },
  });

  // Fetch applicants for selection
  const { data: applicants, isLoading: loadingApplicants } = useQuery({
    queryKey: ['applicants-for-interview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applicants')
        .select('id, full_name, email, status')
        .in('status', ['screening', 'interview_scheduled', 'new'])
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
  });

  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const scheduledAt = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from('interviews').insert({
        applicant_id: data.applicant_id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: data.duration_minutes,
        location: data.location || null,
        meeting_link: data.meeting_link || null,
        notes: data.notes || null,
        status: 'scheduled',
      });

      if (error) throw error;

      // Update applicant status to interview_scheduled
      await supabase
        .from('applicants')
        .update({ status: 'interview_scheduled' })
        .eq('id', data.applicant_id);
    },
    onSuccess: () => {
      toast({ title: t('common', 'success'), description: 'Interview scheduled successfully' });
      navigate('/hr/interviews');
    },
    onError: (error) => {
      toast({ title: t('common', 'error'), description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FormData) => {
    createInterviewMutation.mutate(data);
  };

  const selectedApplicant = applicants?.find(a => a.id === form.watch('applicant_id'));

  return (
    <HRLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('interviews', 'scheduleNew')}
            </h1>
            <p className="text-muted-foreground">
              Schedule a new interview with an applicant
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Applicant Selection */}
                  <FormField
                    control={form.control}
                    name="applicant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Applicant
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an applicant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingApplicants ? (
                              <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : (
                              applicants?.map((applicant) => (
                                <SelectItem key={applicant.id} value={applicant.id}>
                                  {applicant.full_name} - {applicant.email}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Selected Applicant Info */}
                  {selectedApplicant && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">{selectedApplicant.full_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedApplicant.email}</p>
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: language === 'ar' ? ar : undefined })
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(parseInt(val))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Office Room 3, Main Building" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Meeting Link */}
                  <FormField
                    control={form.control}
                    name="meeting_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Meeting Link (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://meet.google.com/..." 
                            type="url"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional notes for this interview..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createInterviewMutation.isPending}
                    >
                      <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {createInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </HRLayout>
  );
}

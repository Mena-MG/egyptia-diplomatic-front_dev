import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Mail, Phone, GraduationCap, MapPin } from "lucide-react";
import { z } from "zod";

// Validation schema for join application form
const joinFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم يجب ألا يتجاوز 100 حرف")
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, "الاسم يجب أن يحتوي على حروف فقط"),
  email: z.string()
    .trim()
    .email("البريد الإلكتروني غير صحيح")
    .max(255, "البريد الإلكتروني طويل جداً"),
  phone: z.string()
    .trim()
    .regex(/^01[0125][0-9]{8}$/, "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)"),
  age: z.number()
    .int("العمر يجب أن يكون رقماً صحيحاً")
    .min(16, "العمر يجب أن يكون 16 سنة على الأقل")
    .max(40, "العمر يجب ألا يتجاوز 40 سنة"),
  governorate: z.string()
    .trim()
    .min(2, "المحافظة مطلوبة")
    .max(50, "اسم المحافظة طويل جداً"),
  education: z.string()
    .trim()
    .min(5, "المؤهل الدراسي يجب أن يكون 5 أحرف على الأقل")
    .max(200, "المؤهل الدراسي طويل جداً"),
  experience: z.string()
    .trim()
    .max(1000, "الخبرات يجب ألا تتجاوز 1000 حرف")
    .optional()
    .transform(val => val === "" ? undefined : val),
  motivation: z.string()
    .trim()
    .min(20, "دوافعك يجب أن تكون 20 حرفاً على الأقل")
    .max(1000, "الدوافع يجب ألا تتجاوز 1000 حرف"),
});

const JoinForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    governorate: "",
    education: "",
    experience: "",
    motivation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    
    // Validate with Zod
    const validationResult = joinFormSchema.safeParse({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      toast({
        title: "يرجى تصحيح الأخطاء",
        description: "تحقق من البيانات المدخلة",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const validatedData = validationResult.data;
    
    try {
      const response = await fetch(
        'https://grgtrnkyonuocxesstrf.supabase.co/functions/v1/submit-application',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            age: validatedData.age,
            governorate: validatedData.governorate,
            education: validatedData.education,
            experience: validatedData.experience || null,
            motivation: validatedData.motivation,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error_ar || result.error || "فشل في إرسال الطلب";
        toast({
          title: response.status === 429 ? "طلبات كثيرة جداً" : "حدث خطأ",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "تم إرسال طلبك بنجاح! ✓",
        description: "سيتم التواصل معك قريباً",
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        governorate: "",
        education: "",
        experience: "",
        motivation: "",
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في الاتصال بالخادم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="join" className="py-24 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            انضم إلينا
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            كن جزءاً من أول كيان شبابي متخصص في الدبلوماسية الشبابية في مصر
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-gradient-card border border-border/50 rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                الاسم الكامل
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                required
                maxLength={100}
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.name ? 'border-destructive' : ''}`}
              />
              {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                maxLength={255}
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.email ? 'border-destructive' : ''}`}
              />
              {formErrors.email && <p className="text-destructive text-xs">{formErrors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                رقم الهاتف
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01xxxxxxxxx"
                required
                maxLength={11}
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.phone ? 'border-destructive' : ''}`}
              />
              {formErrors.phone && <p className="text-destructive text-xs">{formErrors.phone}</p>}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                العمر
              </label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="مثال: 22"
                required
                min="16"
                max="40"
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.age ? 'border-destructive' : ''}`}
              />
              {formErrors.age && <p className="text-destructive text-xs">{formErrors.age}</p>}
            </div>

            {/* Governorate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                المحافظة
              </label>
              <Input
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                placeholder="مثال: القاهرة"
                required
                maxLength={50}
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.governorate ? 'border-destructive' : ''}`}
              />
              {formErrors.governorate && <p className="text-destructive text-xs">{formErrors.governorate}</p>}
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                المؤهل الدراسي
              </label>
              <Input
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="مثال: بكالوريوس علوم سياسية"
                required
                maxLength={200}
                className={`bg-secondary/50 border-border/50 focus:border-primary ${formErrors.education ? 'border-destructive' : ''}`}
              />
              {formErrors.education && <p className="text-destructive text-xs">{formErrors.education}</p>}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium text-foreground">
              خبراتك التطوعية السابقة (إن وجدت)
            </label>
            <Textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="اذكر أي خبرات تطوعية أو قيادية سابقة..."
              rows={3}
              maxLength={1000}
              className={`bg-secondary/50 border-border/50 focus:border-primary resize-none ${formErrors.experience ? 'border-destructive' : ''}`}
            />
            {formErrors.experience && <p className="text-destructive text-xs">{formErrors.experience}</p>}
          </div>

          {/* Motivation */}
          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium text-foreground">
              لماذا تريد الانضمام للجبهة؟
            </label>
            <Textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              placeholder="شاركنا دوافعك وأهدافك..."
              required
              rows={4}
              maxLength={1000}
              className={`bg-secondary/50 border-border/50 focus:border-primary resize-none ${formErrors.motivation ? 'border-destructive' : ''}`}
            />
            {formErrors.motivation && <p className="text-destructive text-xs">{formErrors.motivation}</p>}
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button
              type="submit"
              variant="gold"
              size="xl"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  إرسال الطلب
                </span>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default JoinForm;

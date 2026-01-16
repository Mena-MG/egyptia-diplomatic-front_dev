import { motion } from "framer-motion";
import { Crown, Users, Briefcase, User, Mail, Phone, LucideIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizationMember {
  id: string;
  role: string;
  photo_url?: string;
  full_name_ar: string;
  full_name_en?: string;
  position_title_ar?: string;
  position_title_en?: string;
  bio_ar?: string;
  bio_en?: string;
  email?: string;
  phone?: string;
  committees?: {
    name_ar: string;
    name_en: string;
  };
}

const roleLabels: Record<string, { ar: string; en: string; icon: LucideIcon }> = {
  president: { ar: 'رئيس الكيان', en: 'President', icon: Crown },
  coordinator: { ar: 'المنسقين', en: 'Coordinators', icon: Users },
  committee_head: { ar: 'رؤساء اللجان', en: 'Committee Heads', icon: Briefcase },
  committee_deputy: { ar: 'نواب رؤساء اللجان', en: 'Committee Deputies', icon: User },
};

export default function OrganizationalStructurePage() {
  const { language } = useLanguage();

  const { data: structure, isLoading } = useQuery({
    queryKey: ['organizational-structure-public'],
    queryFn: async () => {
      // @ts-ignore
      const { data } = await supabase
        .from('organizational_structure')
        .select('*, committees:committee_id(id, name_ar, name_en)')
        .eq('is_active', true)
        .order('role')
        .order('display_order');
      return data || [];
    },
  });

  const groupedStructure = structure?.reduce((acc: Record<string, OrganizationMember[]>, member: any) => {
    const typedMember = member as OrganizationMember;
    if (!acc[typedMember.role]) acc[typedMember.role] = [];
    acc[typedMember.role].push(typedMember);
    return acc;
  }, {});

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>الهيكل الإداري | الجبهة الدبلوماسية المصرية</title>
        <meta
          name="description"
          content="الهيكل الإداري للجبهة الدبلوماسية المصرية - رئيس الكيان، المنسقين، رؤساء اللجان"
        />
        <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
                الهيكل الإداري
              </h1>
              <p className="text-muted-foreground text-lg">
                Organizational Structure
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-12">
                {/* Display by role */}
                {Object.entries(roleLabels).map(([roleKey, roleLabel], index) => {
                  const members = groupedStructure?.[roleKey] || [];
                  if (members.length === 0) return null;

                  const Icon = roleLabel.icon;
                  return (
                    <motion.section
                      key={roleKey}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                          {language === 'ar' ? roleLabel.ar : roleLabel.en}
                        </h2>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member: OrganizationMember, memberIndex: number) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + memberIndex * 0.05 }}
                            className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:glow-gold"
                          >
                            {/* Photo/Avatar */}
                            <div className="flex justify-center mb-4">
                              {member.photo_url ? (
                                <Avatar className="w-24 h-24 border-2 border-primary/30">
                                  <AvatarImage src={member.photo_url} alt={language === 'ar' ? member.full_name_ar : member.full_name_en || member.full_name_ar} />
                                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                    {getInitials(language === 'ar' ? member.full_name_ar : member.full_name_en || member.full_name_ar)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="w-24 h-24 border-2 border-primary/30">
                                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                    {getInitials(language === 'ar' ? member.full_name_ar : member.full_name_en || member.full_name_ar)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-bold text-center mb-2">
                              {language === 'ar' ? member.full_name_ar : member.full_name_en || member.full_name_ar}
                            </h3>

                            {/* Position Title */}
                            {member.position_title_ar && (
                              <p className="text-primary text-center font-semibold mb-3">
                                {language === 'ar' ? member.position_title_ar : member.position_title_en || member.position_title_ar}
                              </p>
                            )}

                            {/* Committee */}
                            {member.committees && (
                              <p className="text-muted-foreground text-center text-sm mb-3">
                                {language === 'ar' ? member.committees.name_ar : member.committees.name_en}
                              </p>
                            )}

                            {/* Bio */}
                            {member.bio_ar && (
                              <p className="text-muted-foreground text-sm text-center mb-4 line-clamp-3">
                                {language === 'ar' ? member.bio_ar : member.bio_en || member.bio_ar}
                              </p>
                            )}

                            {/* Contact Info */}
                            {(member.email || member.phone) && (
                              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                                {member.email && (
                                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">
                                      {member.email}
                                    </a>
                                  </div>
                                )}
                                {member.phone && (
                                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${member.phone}`} className="hover:text-primary transition-colors">
                                      {member.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  );
                })}

                {(!structure || structure.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>لا يوجد بيانات للهيكل الإداري حالياً</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

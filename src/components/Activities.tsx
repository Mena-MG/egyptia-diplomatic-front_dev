import { motion } from "framer-motion";
import { BookOpen, Shield, Landmark, Cpu, Heart } from "lucide-react";

const activities = [
  {
    icon: BookOpen,
    title: "الدبلوماسية الشبابية",
    description: "تدريب كوادر شبابية على فن التفاوض والتمثيل الخارجي والمشاركة في منتديات دولية",
  },
  {
    icon: Shield,
    title: "الأمن القومي المجتمعي",
    description: "التوعية بقضايا الأمن القومي المائي والمعلوماتي والصحي والبيئي",
  },
  {
    icon: Landmark,
    title: "التمكين السياسي",
    description: "برامج تعريف الشباب بالدستور والحقوق والواجبات ودعم المشاركة الانتخابية",
  },
  {
    icon: Cpu,
    title: "التحول الرقمي",
    description: "تطوير أدوات تحليل رأي الشباب عبر الذكاء الاصطناعي والتدريب التقني",
  },
  {
    icon: Heart,
    title: "الهوية الوطنية",
    description: "برامج مقاومة التشدد وتعزيز فكرة الهوية الجامعة والوعي بتاريخ الدولة",
  },
];

const events2025 = [
  "البرنامج التدريبي \"السياسة الخارجية للدول الكبرى\"",
  "مساهمات بحثية في ملف الأمن القومي والمعلوماتي",
  "البرنامج التدريبي \"الدبلوماسية وتنمية الذات\"",
  "حملة \"إحنا القرار – اختار بوعي\" للتوعية الانتخابية",
  "منتدى الحوار السياسي الشبابي",
  "ملتقى الدبلوماسية الشبابية الأول",
];

const Activities = () => {
  return (
    <section id="activities" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            ملفاتنا وأنشطتنا
          </h2>
          <p className="text-muted-foreground text-lg">
            Our Key Areas & Activities
          </p>
        </motion.div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:glow-gold"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <activity.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2025 Events */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-card border border-border/50 rounded-3xl p-8 md:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-8 text-center">
            الفعاليات البارزة 2025
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {events2025.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-foreground">{event}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Activities;

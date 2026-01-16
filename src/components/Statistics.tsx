import { motion } from "framer-motion";
import { Users, MapPin, Calendar, Globe, TrendingUp, Tv } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "36,000+",
    label: "عضو فعّال",
    labelEn: "Active Members",
  },
  {
    icon: MapPin,
    value: "28",
    label: "محافظة",
    labelEn: "Governorates",
  },
  {
    icon: Globe,
    value: "8",
    label: "دول خارج مصر",
    labelEn: "Countries Abroad",
  },
  {
    icon: Calendar,
    value: "1,240+",
    label: "فعالية منفذة",
    labelEn: "Events Executed",
  },
  {
    icon: TrendingUp,
    value: "87%",
    label: "شباب 18-35",
    labelEn: "Youth 18-35",
  },
  {
    icon: Tv,
    value: "100+",
    label: "ظهور إعلامي",
    labelEn: "Media Appearances",
  },
];

const Statistics = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            إنجازاتنا بالأرقام
          </h2>
          <p className="text-muted-foreground text-lg">
            Our Achievements in Numbers
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 text-center hover:glow-gold">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Value */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2"
                >
                  {stat.value}
                </motion.div>

                {/* Labels */}
                <p className="text-foreground font-semibold text-sm mb-1">
                  {stat.label}
                </p>
                <p className="text-muted-foreground text-xs">
                  {stat.labelEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30">
            <p className="text-lg md:text-xl text-foreground">
              <span className="text-primary font-bold">8 سنوات</span> من العمل المتواصل في خدمة الشباب المصري
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Statistics;

import { motion } from "framer-motion";
import { Eye, Target, Compass } from "lucide-react";

const aboutCards = [
  {
    icon: Eye,
    title: "الرؤية",
    titleEn: "Vision",
    content:
      "أن تصبح الجبهة الدبلوماسية المصرية منصة وطنية شبابية رائدة، تُعبر عن صوت الشباب المصري داخليًا وخارجيًا، وتسهم في بناء جيل واعٍ بالقضايا الوطنية والدولية.",
  },
  {
    icon: Target,
    title: "الرسالة",
    titleEn: "Mission",
    content:
      "تمكين الشباب المصري ليكون عنصرًا فاعلًا في المسار الوطني والدبلوماسي، عبر التوعية السياسية، والتأهيل القيادي، وصناعة كوادر شبابية قادرة على تمثيل مصر.",
  },
  {
    icon: Compass,
    title: "القيم",
    titleEn: "Values",
    content:
      "الوطنية • الالتزام • الشفافية • التمكين • الانتماء • التأثير المسؤول",
  },
];

const goals = [
  "تعزيز الوعي السياسي والهوية الوطنية لدى الشباب",
  "نشر ثقافة الدبلوماسية العامة والاتصال الدولي",
  "بناء كوادر شبابية في مجالات الشأن العام والسياسات الدولية",
  "دعم المبادرات الشبابية الوطنية",
  "تمثيل الشباب المصري في المحافل الإقليمية والدولية",
];

const About = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
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
            من نحن
          </h2>
          <p className="text-muted-foreground text-lg">
            About Us
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {aboutCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:glow-gold"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <card.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{card.titleEn}</p>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed">
                {card.content}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-primary/5 transform rotate-45 translate-x-10 -translate-y-10" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-card border border-border/50 rounded-3xl p-8 md:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-8 text-center">
            أهدافنا
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                <p className="text-foreground leading-relaxed">{goal}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

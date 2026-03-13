import { motion } from "framer-motion";
import { whyUsReasons } from "@/data/services";

const WhyUsSection = () => {
  return (
    <section className="py-24 bg-hero grid-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground mt-3">
            Tu infraestructura IT en las mejores manos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyUsReasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-hero-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-hero-foreground/60 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;

import { motion } from "framer-motion";
import { Clock, Headphones, Shield, Award } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const icons = [Clock, Headphones, Shield, Award];

const WhyUsSection = () => {
  const sectionLabel = useCMSValue('whyus_section_label', '¿Por qué elegirnos?');
  const sectionTitle = useCMSValue('whyus_section_title', 'Tu infraestructura IT en las mejores manos');

  const reasons = [
    { title: useCMSValue('whyus_reason_1_title', '+20 años de experiencia'), description: useCMSValue('whyus_reason_1_desc', 'Más de dos décadas resolviendo retos tecnológicos empresariales.') },
    { title: useCMSValue('whyus_reason_2_title', 'Soporte 24x7'), description: useCMSValue('whyus_reason_2_desc', 'Equipo técnico disponible las 24 horas, los 7 días de la semana.') },
    { title: useCMSValue('whyus_reason_3_title', 'Seguridad garantizada'), description: useCMSValue('whyus_reason_3_desc', 'Protocolos de seguridad avanzados y cumplimiento RGPD.') },
    { title: useCMSValue('whyus_reason_4_title', 'SLA garantizado'), description: useCMSValue('whyus_reason_4_desc', 'Acuerdos de nivel de servicio con tiempos de respuesta comprometidos.') },
  ];

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
            {sectionLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground mt-3">
            {sectionTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
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

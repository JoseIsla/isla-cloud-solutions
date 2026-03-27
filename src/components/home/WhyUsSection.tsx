import { motion } from "framer-motion";
import { Clock, Headphones, Shield, Award } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const icons = [Clock, Headphones, Shield, Award];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const WhyUsSection = () => {
  const sectionLabel = useCMSValue('whyus_section_label', '¿Por qué elegirnos?');
  const sectionTitle = useCMSValue('whyus_section_title', 'Tu infraestructura IT en las mejores manos');
  const sectionSubtitle = useCMSValue('whyus_section_subtitle', 'A diferencia de proveedores que solo "arreglan" problemas, adoptamos un enfoque proactivo para prevenir incidencias, desbloquear eficiencias e impulsar el crecimiento a largo plazo.');

  const reasons = [
    { title: useCMSValue('whyus_reason_1_title', '+20 años de experiencia'), description: useCMSValue('whyus_reason_1_desc', 'Más de dos décadas resolviendo retos tecnológicos empresariales con un equipo de expertos certificados.') },
    { title: useCMSValue('whyus_reason_2_title', 'Soporte 24x7'), description: useCMSValue('whyus_reason_2_desc', 'Cuando tu equipo necesita ayuda, no debería tener que esperar. Nuestro soporte está siempre disponible.') },
    { title: useCMSValue('whyus_reason_3_title', 'Seguridad garantizada'), description: useCMSValue('whyus_reason_3_desc', 'Monitorización 24/7, autenticación multifactor y experiencia nivel CISO mantienen tu organización segura.') },
    { title: useCMSValue('whyus_reason_4_title', 'Transparencia total'), description: useCMSValue('whyus_reason_4_desc', 'Sin sorpresas. Cada ticket, dispositivo y tiempo de respuesta es visible a través de nuestro portal de cliente.') },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-bold uppercase tracking-widest">
              {sectionLabel}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-4 leading-tight">
              {sectionTitle}
            </h2>
            <p className="text-muted-foreground text-lg mt-6 leading-relaxed">
              {sectionSubtitle}
            </p>
          </motion.div>

          {/* Right side - Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, index) => {
              const Icon = icons[index];
              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.06] transition-[border-color,box-shadow] duration-300 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;

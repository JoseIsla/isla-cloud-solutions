import { motion } from "framer-motion";
import { Clock, Headphones, Shield, Award } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const icons = [Clock, Headphones, Shield, Award];
const colors = ['primary', 'accent', 'primary', 'accent'] as const;

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
    <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            {sectionLabel && (
              <div
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-6"
                style={{
                  background: 'hsl(var(--primary) / 0.06)',
                  border: '1px solid hsl(var(--primary) / 0.12)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                />
                <span
                  className="text-[10px] tracking-[0.2em] uppercase font-medium"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  {sectionLabel}
                </span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-muted-foreground text-lg mt-6 leading-relaxed font-light">
              {sectionSubtitle}
            </p>
          </motion.div>

          {/* Right side - Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, index) => {
              const Icon = icons[index];
              const color = colors[index];
              const isOffset = index % 2 === 1;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`group relative flex flex-col p-7 rounded-3xl overflow-hidden transition-all duration-500 ${isOffset ? 'sm:translate-y-4' : ''}`}
                  style={{
                    background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted) / 0.5))',
                    border: '1px solid hsl(var(--border) / 0.6)',
                    boxShadow: '0 8px 40px -12px hsl(var(--foreground) / 0.08)',
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: color === 'primary'
                        ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)'
                        : 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.4), transparent)',
                    }}
                  />

                  {/* Hover glow */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: color === 'primary'
                        ? 'radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)'
                        : 'radial-gradient(circle, hsl(var(--accent) / 0.06), transparent 70%)',
                    }}
                  />

                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10 transition-colors duration-300"
                    style={{
                      background: color === 'primary'
                        ? 'hsl(var(--primary) / 0.08)'
                        : 'hsl(var(--accent) / 0.08)',
                    }}
                  >
                    <Icon
                      size={22}
                      className="transition-colors duration-300"
                      style={{
                        color: color === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                      }}
                    />
                  </div>

                  <h3 className="font-heading font-bold text-foreground mb-2 relative z-10">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-light relative z-10">
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

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const CTASection = () => {
  const title = useCMSValue('cta_title', '¿Listo para impulsar tu empresa?');
  const subtitle = useCMSValue('cta_subtitle', 'Contacta con nosotros y descubre cómo podemos ayudarte a optimizar tu infraestructura tecnológica.');
  const buttonText = useCMSValue('cta_button', 'Contactar ahora');
  const phone = useCMSValue('contact_phone', '+34 900 000 000');

  const card1Title = useCMSValue('cta_card1_title', '¿Necesitas ayuda?');
  const card1Desc = useCMSValue('cta_card1_desc', 'Llama a nuestro equipo y te ayudaremos con cualquier consulta técnica.');
  const card2Title = useCMSValue('cta_card2_title', 'Enfoque proactivo');
  const card2Desc = useCMSValue('cta_card2_desc', 'Precios flexibles y adaptados. Solo pagas por lo que necesitas, cuando lo necesitas.');

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-hero">
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-[100%] pointer-events-none mix-blend-screen"
        style={{ background: 'hsl(var(--primary) / 0.1)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-[100%] pointer-events-none mix-blend-screen"
        style={{ background: 'hsl(var(--accent) / 0.1)', filter: 'blur(150px)' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsla(0, 0%, 100%, 0.02) 1px, transparent 1px), linear-gradient(90deg, hsla(0, 0%, 100%, 0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-20">
          {/* Main CTA content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center gap-8 w-full max-w-3xl"
          >
            {/* Status pill */}
            <div
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full"
              style={{
                background: 'hsla(0, 0%, 100%, 0.03)',
                border: '1px solid hsla(0, 0%, 100%, 0.08)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--accent))', boxShadow: '0 0 10px hsl(var(--accent) / 0.8)' }}
              />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(0, 0%, 80%, 0.9)' }}>
                Hablemos
              </span>
            </div>

            {/* Heading with gradient */}
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-balance leading-tight"
              style={{
                backgroundImage: 'linear-gradient(to bottom, hsl(0, 0%, 100%), hsl(0, 0%, 90%), hsl(0, 0%, 60%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </h2>

            <p className="text-lg md:text-xl max-w-[55ch] text-pretty leading-relaxed" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
              {subtitle}
            </p>

            <Button variant="hero" size="xl" asChild className="shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)]">
              <Link to="/contacto">
                {buttonText} <ArrowRight size={20} />
              </Link>
            </Button>
          </motion.div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {/* Card 1 - Phone support */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="group relative flex flex-col p-8 rounded-3xl backdrop-blur-2xl transition-colors duration-300 overflow-hidden"
              style={{
                background: 'hsla(0, 0%, 100%, 0.03)',
                border: '1px solid hsla(0, 0%, 100%, 0.06)',
                boxShadow: 'inset 0 1px 0 0 hsla(0, 0%, 100%, 0.05), 0 10px 40px -10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none transition-colors duration-700"
                style={{ background: 'hsl(var(--primary) / 0.15)', filter: 'blur(60px)' }}
              />

              <div className="flex flex-col h-full gap-6 relative z-10">
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsl(var(--primary))' }}>
                    Soporte directo
                  </div>
                  <h3 className="text-xl font-heading font-medium text-hero-foreground tracking-tight">
                    {card1Title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed max-w-[40ch]" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
                  {card1Desc}
                </p>
                <div className="mt-auto pt-6" style={{ borderTop: '1px solid hsla(0, 0%, 100%, 0.06)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'hsla(0, 0%, 100%, 0.3)' }}>
                      Línea directa
                    </span>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: 'hsla(0, 0%, 100%, 0.85)' }}
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 - Proactive approach */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="group relative flex flex-col p-8 rounded-3xl backdrop-blur-2xl transition-colors duration-300 overflow-hidden"
              style={{
                background: 'hsla(0, 0%, 100%, 0.03)',
                border: '1px solid hsla(0, 0%, 100%, 0.06)',
                boxShadow: 'inset 0 1px 0 0 hsla(0, 0%, 100%, 0.05), 0 10px 40px -10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full pointer-events-none transition-colors duration-700"
                style={{ background: 'hsl(var(--accent) / 0.15)', filter: 'blur(60px)' }}
              />

              <div className="flex flex-col h-full gap-6 relative z-10">
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsl(var(--accent))' }}>
                    Metodología
                  </div>
                  <h3 className="text-xl font-heading font-medium text-hero-foreground tracking-tight">
                    {card2Title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed max-w-[40ch]" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
                  {card2Desc}
                </p>
                <div className="mt-auto pt-6" style={{ borderTop: '1px solid hsla(0, 0%, 100%, 0.06)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'hsla(0, 0%, 100%, 0.3)' }}>
                      Estado
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: 'hsl(var(--accent))' }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'hsla(0, 0%, 100%, 0.85)' }}>
                        Activo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

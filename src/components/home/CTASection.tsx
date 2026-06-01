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
  const pillText = useCMSValue('cta_pill_text', 'Hablemos');

  const card1Title = useCMSValue('cta_card1_title', '¿Necesitas ayuda?');
  const card1Desc = useCMSValue('cta_card1_desc', 'Llama a nuestro equipo y te ayudaremos con cualquier consulta técnica.');
  const card1LabelRaw = useCMSValue('cta_card1_label', 'Teléfono');
  const card1Label = card1LabelRaw.toLowerCase().includes('línea directa') || card1LabelRaw.toLowerCase().includes('linea directa') ? 'Teléfono' : card1LabelRaw;
  const card2Title = useCMSValue('cta_card2_title', 'Enfoque proactivo');
  const card2Desc = useCMSValue('cta_card2_desc', 'Precios flexibles y adaptados. Solo pagas por lo que necesitas, cuando lo necesitas.');

  const ctaCardStyle = {
    background: 'linear-gradient(145deg, hsl(var(--hero-foreground) / 0.08) 0%, hsl(var(--primary) / 0.035) 42%, hsl(var(--hero-bg)) 100%)',
    border: '1px solid hsl(var(--hero-foreground) / 0.1)',
    boxShadow: 'inset 0 1px 0 hsl(var(--hero-foreground) / 0.12), inset 0 -1px 0 hsl(var(--hero-bg) / 0.9), 0 28px 70px -24px hsl(var(--primary) / 0.08), 0 18px 50px -24px hsl(var(--hero-bg) / 0.95)',
  };

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-hero">
      {/* Atmospheric spotlights removed to avoid visible bands behind cards */}


      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            {/* Status pill */}
            {pillText && (
              <div
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-8"
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
                  {pillText}
                </span>
              </div>
            )}

            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-balance leading-tight mb-8"
              style={{
                backgroundImage: 'linear-gradient(to bottom, hsl(0, 0%, 100%), hsl(0, 0%, 90%), hsl(0, 0%, 60%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </h2>

            <p className="text-lg md:text-xl max-w-[45ch] text-pretty leading-relaxed mb-12" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
              {subtitle}
            </p>

            <Button variant="hero" size="xl" asChild className="shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)]">
              <Link to="/contacto">
                {buttonText} <ArrowRight size={20} />
              </Link>
            </Button>
          </motion.div>

          {/* Right Glass Cards – staggered */}
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col sm:flex-row gap-6 relative">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative isolate overflow-hidden flex-[1.3] flex flex-col p-8 md:p-10 rounded-3xl transition-all duration-700 ease-out hover:-translate-y-2"
              style={ctaCardStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{ background: 'radial-gradient(circle at 18% 12%, hsl(var(--accent) / 0.06), transparent 34%), linear-gradient(to bottom, hsl(var(--hero-foreground) / 0.06), transparent 38%)' }}
              />
              <h3 className="relative text-xl font-heading font-medium text-hero-foreground tracking-tight mb-4">
                {card1Title}
              </h3>
              <p className="relative text-sm leading-relaxed text-pretty mb-8" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
                {card1Desc}
              </p>
              <div className="relative mt-auto pt-6" style={{ borderTop: '1px solid hsl(var(--hero-foreground) / 0.08)' }}>
                <div className="flex items-baseline justify-between">
                <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="text-xs uppercase tracking-wider font-medium hover:underline"
                    style={{ color: 'hsla(0, 0%, 100%, 0.3)' }}
                  >
                    {card1Label}
                  </a>
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: 'hsla(0, 0%, 100%, 0.85)' }}
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Card 2 – staggered down */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="relative isolate overflow-hidden flex-1 flex flex-col p-8 md:p-10 rounded-3xl transition-all duration-700 ease-out hover:-translate-y-2 sm:mt-16"
              style={ctaCardStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{ background: 'radial-gradient(circle at 20% 14%, hsl(var(--primary) / 0.05), transparent 34%), linear-gradient(to bottom, hsl(var(--hero-foreground) / 0.06), transparent 38%)' }}
              />
              
              <h3 className="relative text-xl font-heading font-medium text-hero-foreground tracking-tight mb-4">
                {card2Title}
              </h3>
              <p className="relative text-sm leading-relaxed text-pretty mb-8" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
                {card2Desc}
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;

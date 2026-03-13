import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useCMSValue } from "@/hooks/useCMS";

const HeroSection = () => {
  const title = useCMSValue('hero_title', 'Soluciones Cloud y Tecnología para Empresas');
  const subtitle = useCMSValue('hero_subtitle', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.');
  const ctaPrimary = useCMSValue('hero_cta_primary', 'Solicita información');
  const ctaSecondary = useCMSValue('hero_cta_secondary', 'Nuestros servicios');
  const badge = useCMSValue('hero_badge', 'Tu socio tecnológico de confianza');

  const stat1Value = useCMSValue('hero_stat_1_value', '+20');
  const stat1Label = useCMSValue('hero_stat_1_label', 'Años experiencia');
  const stat2Value = useCMSValue('hero_stat_2_value', '24/7');
  const stat2Label = useCMSValue('hero_stat_2_label', 'Soporte técnico');
  const stat3Value = useCMSValue('hero_stat_3_value', '99.9%');
  const stat3Label = useCMSValue('hero_stat_3_label', 'Uptime SLA');

  // Split title to highlight "Tecnología"
  const titleParts = title.split('Tecnología');
  const hasKeyword = titleParts.length > 1;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-hero via-hero/90 to-hero/60" />
      </div>
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/15 text-primary border border-primary/20 mb-6">
              {badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-hero-foreground leading-tight mb-6"
          >
            {hasKeyword ? (
              <>
                {titleParts[0]}
                <span className="text-gradient">Tecnología</span>
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-hero-foreground/70 mb-10 max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/contacto">
                {ctaPrimary} <ArrowRight size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/servicios">{ctaSecondary}</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex gap-10 mt-16 pt-8 border-t border-hero-foreground/10"
          >
            {[
              { number: stat1Value, label: stat1Label },
              { number: stat2Value, label: stat2Label },
              { number: stat3Value, label: stat3Label },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary">{stat.number}</div>
                <div className="text-xs text-hero-foreground/50 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

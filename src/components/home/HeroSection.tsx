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
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block text-white/70 text-base md:text-lg font-body mb-4"
          >
            {badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-heading font-bold text-white leading-[1.1] mb-8"
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
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/contacto">
                {ctaPrimary} <ArrowRight size={20} />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
              asChild
            >
              <Link to="/servicios">{ctaSecondary}</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-start gap-12 md:gap-16 py-5 overflow-x-auto">
              {[
                { number: stat1Value, label: stat1Label },
                { number: stat2Value, label: stat2Label },
                { number: stat3Value, label: stat3Label },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-4 shrink-0">
                  {i > 0 && <div className="w-px h-8 bg-white/20 -ml-6 md:-ml-8" />}
                  <div className={i > 0 ? "pl-2" : ""}>
                    <div className="text-xl md:text-2xl font-heading font-bold text-white">{stat.number}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

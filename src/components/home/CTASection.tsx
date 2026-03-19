import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Settings } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const CTASection = () => {
  const title = useCMSValue('cta_title', '¿Listo para impulsar tu empresa con tecnología?');
  const subtitle = useCMSValue('cta_subtitle', '¿Qué retos IT están frenando tu negocio? Encontremos juntos la solución que impulse tu crecimiento a largo plazo.');
  const buttonText = useCMSValue('cta_button', 'Solicitar consulta gratuita');
  const phone = useCMSValue('contact_phone', '+34 900 000 000');

  return (
    <section className="py-20 md:py-28 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight">
              {title.split(' ').map((word, i) => {
                if (word.toLowerCase() === 'tecnología?' || word.toLowerCase() === 'tecnología') {
                  return <span key={i} className="text-gradient">{word} </span>;
                }
                return word + ' ';
              })}
            </h2>
            <p className="text-white/60 text-lg mt-6 mb-8 leading-relaxed max-w-xl">
              {subtitle}
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/contacto">
                {buttonText} <ArrowRight size={20} />
              </Link>
            </Button>
          </motion.div>

          {/* Right - Contact cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Phone size={22} className="text-primary" />
              </div>
              <h3 className="text-white font-heading font-bold mb-2">¿Necesitas ayuda?</h3>
              <p className="text-white/50 text-sm mb-3">Llama a nuestro equipo y te ayudaremos.</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary text-sm font-semibold hover:underline">
                {phone}
              </a>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Settings size={22} className="text-primary" />
              </div>
              <h3 className="text-white font-heading font-bold mb-2">Enfoque proactivo</h3>
              <p className="text-white/50 text-sm">Precios flexibles y adaptados. Solo pagas por lo que necesitas, cuando lo necesitas.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

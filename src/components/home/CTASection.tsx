import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const CTASection = () => {
  const title = useCMSValue('cta_title', '¿Listo para impulsar tu empresa con tecnología?');
  const subtitle = useCMSValue('cta_subtitle', 'Cuéntanos tu proyecto y te asesoraremos sin compromiso. Somos tu socio tecnológico.');
  const buttonText = useCMSValue('cta_button', 'Solicitar consulta gratuita');

  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground mb-6">
            {title}
          </h2>
          <p className="text-hero-foreground/70 text-lg mb-10">
            {subtitle}
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/contacto">
              {buttonText} <ArrowRight size={20} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

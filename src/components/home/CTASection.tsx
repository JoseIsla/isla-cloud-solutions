import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
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
            ¿Listo para impulsar tu empresa con tecnología?
          </h2>
          <p className="text-hero-foreground/70 text-lg mb-10">
            Cuéntanos tu proyecto y te asesoraremos sin compromiso. Somos tu socio tecnológico.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/contacto">
              Solicitar consulta gratuita <ArrowRight size={20} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

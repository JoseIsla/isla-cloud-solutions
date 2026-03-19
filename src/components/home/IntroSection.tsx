import { motion } from "framer-motion";
import { useCMSValue } from "@/hooks/useCMS";

const IntroSection = () => {
  const introText = useCMSValue(
    'intro_text',
    'Isla Cloud Solutions es tu socio tecnológico estratégico, ofreciendo servicios IT gestionados que impulsan el crecimiento empresarial con el soporte local que esperas, respaldado por experiencia profesional, seguridad proactiva y un servicio disponible 24x7 para mantener tu organización productiva y preparada para el futuro.'
  );

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl md:text-2xl lg:text-3xl font-heading font-medium leading-relaxed text-foreground/80 max-w-5xl"
        >
          <span className="text-gradient font-bold">Isla Cloud Solutions</span>{" "}
          {introText.replace('Isla Cloud Solutions ', '')}
        </motion.p>
      </div>
    </section>
  );
};

export default IntroSection;

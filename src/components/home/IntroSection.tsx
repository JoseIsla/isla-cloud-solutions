import { motion } from "framer-motion";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";

const IntroSection = () => {
  const introText = useCMSValue(
    'intro_text',
    'Isla Cloud Solutions es tu socio tecnológico estratégico, ofreciendo servicios IT gestionados que impulsan el crecimiento empresarial con el soporte local que esperas, respaldado por experiencia profesional, seguridad proactiva y un servicio disponible 24x7 para mantener tu organización productiva y preparada para el futuro.'
  );

  return (
    <section className="sticky top-16 md:top-20 z-10 bg-background pt-14 md:pt-20 pb-20 md:pb-28 lg:pb-32">
      <div className="container mx-auto px-4">
        {introText.startsWith('<') ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[2.75rem] font-heading font-medium leading-[1.9] md:leading-[1.85] max-w-none mx-auto text-justify animated-gradient-text [&>p]:mb-0"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(introText) }}
          />
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[2.75rem] font-heading font-medium leading-[1.9] md:leading-[1.85] max-w-none mx-auto text-justify animated-gradient-text"
          >
            {introText}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default IntroSection;

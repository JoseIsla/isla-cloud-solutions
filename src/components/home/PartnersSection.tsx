import { motion } from "framer-motion";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState } from "react";
import { partnersApi, type PartnerFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";

const PartnersSection = () => {
  const sectionLabel = useCMSValue('partners_section_label', 'Partners');
  const sectionTitle = useCMSValue('partners_section_title', 'Nuestros partners tecnológicos');
  const sectionSubtitle = useCMSValue('partners_section_subtitle', 'Colaboramos con los líderes del sector para ofrecerte las mejores soluciones.');

  const [partners, setPartners] = useState<PartnerFromAPI[]>([]);

  useEffect(() => {
    partnersApi.list().then(setPartners).catch(() => setPartners([]));
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.06]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-14"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            {sectionLabel}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-4 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg mt-4">
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {partners.map((partner, index) => {
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 md:p-8 h-32 md:h-36 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/80 transition-all duration-300"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/[0.03] group-hover:to-accent/[0.05] transition-all duration-500" />

                {partner.logo_url ? (
                  <BlurImage
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-[140px] h-12 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
                    wrapperClassName="flex items-center justify-center w-[140px] h-12"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm font-semibold text-center leading-tight relative z-10">
                    {partner.name}
                  </span>
                )}

                <span className="text-[10px] text-muted-foreground/60 mt-2 uppercase tracking-wider font-medium relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate max-w-full">
                  {partner.name}
                </span>
              </motion.div>
            );

            return partner.website_url ? (
              <a key={partner.id} href={partner.website_url} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            ) : (
              <div key={partner.id}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;

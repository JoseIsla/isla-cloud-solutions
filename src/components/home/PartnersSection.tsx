import { motion } from "framer-motion";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState, useMemo } from "react";
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

  // Duplicate partners for seamless loop
  const marqueePartners = useMemo(() => [...partners, ...partners], [partners]);

  // Calculate animation duration based on partner count
  const duration = partners.length * 5;

  if (partners.length === 0) return null;

  const renderCard = (partner: PartnerFromAPI, index: number) => {
    const card = (
      <div
        className="shrink-0 flex flex-col justify-center items-center w-[220px] sm:w-[260px] md:w-[280px] h-[100px] md:h-[120px] rounded-2xl backdrop-blur-xl relative overflow-hidden group transition-all duration-700 hover:-translate-y-1"
        style={{
          background: 'hsla(0, 0%, 100%, 0.03)',
          border: '1px solid hsla(0, 0%, 100%, 0.06)',
          boxShadow: '0 4px 24px -8px rgba(0,0,0,0.5)',
        }}
      >
        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.1), transparent)',
          }}
        />
        {/* Hover border glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.25)',
            border: '1px solid hsl(var(--primary) / 0.3)',
          }}
        />

        {partner.logo_url ? (
          <BlurImage
            src={partner.logo_url}
            alt={partner.name}
            className="w-[140px] h-12 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-110"
            wrapperClassName="flex items-center justify-center w-[140px] h-12"
          />
        ) : (
          <span className="text-xl md:text-2xl font-bold tracking-tight relative z-10 transition-colors duration-500"
            style={{ color: 'hsla(0, 0%, 85%, 0.9)' }}
          >
            {partner.name}
          </span>
        )}
      </div>
    );

    return partner.website_url ? (
      <a key={`${partner.id}-${index}`} href={partner.website_url} target="_blank" rel="noopener noreferrer">
        {card}
      </a>
    ) : (
      <div key={`${partner.id}-${index}`}>{card}</div>
    );
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-hero">
      {/* Ambient glows */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none mix-blend-screen"
        style={{ background: 'hsl(var(--primary) / 0.08)', filter: 'blur(150px)' }}
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen"
        style={{ background: 'hsl(var(--accent) / 0.06)', filter: 'blur(120px)' }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md mb-6"
            style={{
              background: 'hsla(0, 0%, 100%, 0.03)',
              border: '1px solid hsla(0, 0%, 100%, 0.08)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'hsl(var(--accent))' }}
            />
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: 'hsla(0, 0%, 80%, 0.9)' }}
            >
              {sectionLabel}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-hero-foreground mt-2 leading-tight tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-lg mt-4 max-w-2xl" style={{ color: 'hsla(0, 0%, 100%, 0.5)' }}>
            {sectionSubtitle}
          </p>
        </motion.div>
      </div>

      {/* Marquee container */}
      <div className="relative w-full marquee-container">
        {/* Fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-24 md:w-48 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to right, hsl(var(--hero-bg)), transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 md:w-48 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to left, hsl(var(--hero-bg)), transparent)' }}
        />

        <div
          className="flex w-max animate-marquee gap-5 md:gap-6"
          style={{ animationDuration: `${duration}s` }}
        >
          {marqueePartners.map((partner, i) => renderCard(partner, i))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;

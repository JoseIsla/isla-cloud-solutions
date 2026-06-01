import { motion } from "framer-motion";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState, useMemo } from "react";
import { clientsApi, type ClientFromAPI } from "@/lib/api";
import { clientLogos } from "@/data/services";
import { useCMSValue } from "@/hooks/useCMS";
import { toLogoThumb } from "@/lib/logoThumb";


const MarqueeRow = ({
  items,
  reverse = false,
  duration = 50,
}: {
  items: { name: string; logo_url?: string; website_url?: string }[];
  reverse?: boolean;
  duration?: number;
}) => {
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} gap-5 md:gap-6 hover:[animation-play-state:paused]`}
      style={{ animationDuration: `${duration}s` }}
    >
      {doubled.map((client, index) => {
        const card = (
          <div
            className="shrink-0 flex items-center justify-center w-[220px] sm:w-[260px] md:w-[280px] h-[100px] md:h-[120px] rounded-2xl backdrop-blur-xl relative overflow-hidden group transition-all duration-700 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(145deg, hsla(0, 0%, 100%, 0.03) 0%, hsla(0, 0%, 100%, 0.01) 100%)',
              border: '1px solid hsla(0, 0%, 100%, 0.06)',
              boxShadow: 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.06), 0 4px 24px -1px rgba(0,0,0,0.5)',
            }}
          >
            {/* Hover glow overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: index % 2 === 0
                  ? 'linear-gradient(to top right, hsl(var(--primary) / 0.1), transparent)'
                  : 'linear-gradient(to top right, hsl(var(--accent) / 0.1), transparent)',
              }}
            />
            {/* Hover glow shadow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: index % 2 === 0
                  ? '0 0 30px -5px hsl(var(--primary) / 0.4)'
                  : '0 0 30px -5px hsl(var(--accent) / 0.4)',
              }}
            />

            {client.logo_url ? (
              <BlurImage
                src={toLogoThumb(client.logo_url) || client.logo_url}
                fallbackSrc={client.logo_url}
                alt={client.name}
                placeholderColor="transparent"
                noWebp
                loading="lazy"
                decoding="async"
                className="max-h-[56px] md:max-h-[64px] max-w-[160px] md:max-w-[180px] w-auto h-auto object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
                wrapperClassName="flex items-center justify-center w-[200px] md:w-[240px] h-[80px] md:h-[96px] bg-transparent p-2"
                style={{ background: 'transparent', mixBlendMode: 'normal' }}
              />
            ) : (

              <span className="text-lg md:text-xl font-bold tracking-tight relative z-10 transition-colors duration-300"
                style={{ color: 'hsla(0, 0%, 100%, 0.7)' }}
              >
                {client.name}
              </span>
            )}
          </div>
        );

        return client.website_url ? (
          <a key={`${client.name}-${index}`} href={client.website_url} target="_blank" rel="noopener noreferrer">
            {card}
          </a>
        ) : (
          <div key={`${client.name}-${index}`}>{card}</div>
        );
      })}
    </div>
  );
};

const ClientsSection = () => {
  const sectionLabel = useCMSValue('clients_section_label', 'Clientes');
  const sectionTitle = useCMSValue('clients_section_title', 'Empresas que confían en nosotros');
  const sectionSubtitle = useCMSValue('clients_section_subtitle', 'Más de 60 empresas e instituciones de todos los sectores confían en nuestros servicios IT.');
  const bgImage = useCMSValue('clients_bg_image', '');

  const [apiClients, setApiClients] = useState<ClientFromAPI[] | null>(null);

  useEffect(() => {
    clientsApi.list()
      .then(setApiClients)
      .catch(() => setApiClients(null));
  }, []);

  const clients = apiClients && apiClients.length > 0
    ? apiClients.map(c => ({ name: c.name, logo_url: c.logo_url || undefined, website_url: c.website_url || undefined }))
    : clientLogos.map(name => ({ name }));

  const half = Math.ceil(clients.length / 2);
  const row1 = clients.slice(0, half);
  const row2 = clients.slice(half);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-hero">
      {/* Optional background image */}
      {bgImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0" style={{ background: 'hsl(var(--hero-bg) / 0.85)' }} />
        </>
      )}
      {/* Ambient prismatic glows */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen pointer-events-none"
        style={{ background: 'hsl(var(--primary) / 0.12)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen pointer-events-none"
        style={{ background: 'hsl(var(--accent) / 0.08)', filter: 'blur(150px)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] pointer-events-none"
        style={{ background: 'hsl(var(--primary) / 0.05)', filter: 'blur(80px)' }}
      />

      {/* Header */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-16"
        >
          {sectionLabel && (
            <div className="flex items-center gap-4 mb-6">
              <div
                className="h-[1px] w-8"
                style={{ background: 'linear-gradient(to right, transparent, hsl(var(--accent) / 0.5))' }}
              />
              <span
                className="text-xs font-medium tracking-[0.2em] uppercase"
                style={{ color: 'hsl(var(--accent) / 0.9)' }}
              >
                {sectionLabel}
              </span>
              <div
                className="h-[1px] w-8"
                style={{ background: 'linear-gradient(to left, transparent, hsl(var(--accent) / 0.5))' }}
              />
            </div>
          )}
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-hero-foreground leading-tight"
          >
            {sectionTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-lg tracking-wide font-light leading-relaxed" style={{ color: 'hsla(0, 0%, 100%, 0.45)' }}>
            {sectionSubtitle}
          </p>
        </motion.div>
      </div>

      {/* Dual marquee */}
      <div
        className="relative w-full flex flex-col gap-5 z-10 overflow-hidden py-2"
        style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)' }}
      >
        <MarqueeRow items={row1} duration={row1.length * 5} />
        <MarqueeRow items={row2} reverse duration={row2.length * 5} />
      </div>
    </section>
  );
};

export default ClientsSection;

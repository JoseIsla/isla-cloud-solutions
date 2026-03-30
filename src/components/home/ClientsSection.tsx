import { motion } from "framer-motion";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState } from "react";
import { clientsApi, type ClientFromAPI } from "@/lib/api";
import { clientLogos } from "@/data/services";
import { useCMSValue } from "@/hooks/useCMS";

const MarqueeRow = ({
  items,
  reverse = false,
  duration = 60,
}: {
  items: { name: string; logo_url?: string; website_url?: string }[];
  reverse?: boolean;
  duration?: number;
}) => {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden marquee-container">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex gap-5 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((client, index) => {
          const card = (
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300 w-[200px] h-20"
            >
              {client.logo_url ? (
                <BlurImage src={client.logo_url} alt={client.name} className="w-[140px] h-10 object-contain" wrapperClassName="flex items-center justify-center w-[140px] h-10" />
              ) : (
                <span className="text-muted-foreground text-sm font-medium text-center leading-tight whitespace-nowrap">
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
    </div>
  );
};

const ClientsSection = () => {
  const sectionLabel = useCMSValue('clients_section_label', 'Clientes');
  const sectionTitle = useCMSValue('clients_section_title', 'Empresas que confían en nosotros');
  const sectionSubtitle = useCMSValue('clients_section_subtitle', 'Más de 60 empresas e instituciones de todos los sectores confían en nuestros servicios IT.');

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
    <section className="py-14 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
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
      </div>

      <div className="space-y-5">
        <MarqueeRow items={row1} duration={50} />
        <MarqueeRow items={row2} reverse duration={55} />
      </div>
    </section>
  );
};

export default ClientsSection;

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { clientsApi, type ClientFromAPI } from "@/lib/api";
import { clientLogos } from "@/data/services";
import { useCMSValue } from "@/hooks/useCMS";

const MarqueeRow = ({
  items,
  reverse = false,
  duration = 60,
}: {
  items: { name: string; logo_url?: string }[];
  reverse?: boolean;
  duration?: number;
}) => {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden marquee-container">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-secondary/50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-secondary/50 to-transparent" />
      <div
        className={`flex gap-4 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((client, index) => (
          <div
            key={`${client.name}-${index}`}
            className="flex-shrink-0 flex items-center justify-center px-6 py-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-16 min-w-[180px]"
          >
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.name} className="h-8 max-w-[140px] object-contain" />
            ) : (
              <span className="text-muted-foreground text-sm font-medium text-center leading-tight whitespace-nowrap">
                {client.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientsSection = () => {
  const sectionLabel = useCMSValue('clients_section_label', 'Clientes');
  const sectionTitle = useCMSValue('clients_section_title', 'Empresas que confían en nosotros');
  const sectionSubtitle = useCMSValue('clients_section_subtitle', 'Más de 60 empresas e instituciones de todos los sectores');

  const [apiClients, setApiClients] = useState<ClientFromAPI[] | null>(null);

  useEffect(() => {
    clientsApi.list()
      .then(setApiClients)
      .catch(() => setApiClients(null));
  }, []);

  const clients = apiClients && apiClients.length > 0
    ? apiClients.map(c => ({ name: c.name, logo_url: c.logo_url || undefined }))
    : clientLogos.map(name => ({ name }));

  const half = Math.ceil(clients.length / 2);
  const row1 = clients.slice(0, half);
  const row2 = clients.slice(half);

  return (
    <section className="py-20 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            {sectionLabel}
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-3">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            {sectionSubtitle}
          </p>
        </motion.div>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={row1} duration={50} />
        <MarqueeRow items={row2} reverse duration={55} />
      </div>
    </section>
  );
};

export default ClientsSection;

import { motion } from "framer-motion";
import { clientLogos } from "@/data/services";

const half = Math.ceil(clientLogos.length / 2);
const row1 = clientLogos.slice(0, half);
const row2 = clientLogos.slice(half);

const MarqueeRow = ({
  items,
  reverse = false,
  duration = 60,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) => {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-secondary/50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-secondary/50 to-transparent" />

      <div
        className={`flex gap-4 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((client, index) => (
          <div
            key={`${client}-${index}`}
            className="flex-shrink-0 flex items-center justify-center px-6 py-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-16 min-w-[180px]"
          >
            <span className="text-muted-foreground text-sm font-medium text-center leading-tight whitespace-nowrap">
              {client}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientsSection = () => {
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
            Clientes
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-3">
            Empresas que confían en nosotros
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Más de 60 empresas e instituciones de todos los sectores
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

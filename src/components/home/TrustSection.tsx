import { motion } from "framer-motion";
import { ExternalLink, Star, Shield } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";

const trustBadges = [
  {
    name: "TrustLocal",
    score: "9,0",
    maxScore: "10",
    reviews: 10,
    url: "https://trustlocal.es/madrid/parla/diseno-web/isla-cloud-solutions/",
    stars: 4.5,
    description: "Diseñadores web en Parla",
  },
];

const TrustSection = () => {
  const sectionLabel = useCMSValue('trust_section_label', 'Confianza');
  const sectionTitle = useCMSValue('trust_section_title', 'Verificados por plataformas independientes');
  const sectionSubtitle = useCMSValue('trust_section_subtitle', 'Nuestra reputación está respaldada por reseñas reales de clientes en plataformas de confianza.');

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={i <= rating ? 'text-amber-400' : i - 0.5 <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}
          fill={i <= rating || i - 0.5 <= rating ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <span className="text-primary text-sm font-bold uppercase tracking-widest">
              {sectionLabel}
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-3">
              {sectionTitle}
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              {sectionSubtitle}
            </p>
          </motion.div>

          {/* Right badges */}
          <div className="flex flex-wrap gap-6 justify-center">
            {trustBadges.map((badge) => (
              <motion.a
                key={badge.name}
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group flex items-center gap-6 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {badge.name}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-heading font-bold text-foreground">{badge.score}</span>
                    <span className="text-sm text-muted-foreground">/{badge.maxScore}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1">{renderStars(badge.stars)}</div>
                  <span className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    {badge.reviews} reseñas <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

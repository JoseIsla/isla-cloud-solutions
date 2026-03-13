import { motion } from "framer-motion";
import { ExternalLink, Star, Shield, Award } from "lucide-react";
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
    icon: Award,
  },
];

const TrustSection = () => {
  const sectionLabel = useCMSValue('trust_section_label', 'Confianza');
  const sectionTitle = useCMSValue('trust_section_title', 'Verificados por plataformas independientes');
  const sectionSubtitle = useCMSValue('trust_section_subtitle', 'Nuestra reputación está respaldada por reseñas reales de clientes');

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fill = i <= Math.floor(rating) ? 'text-amber-400' : i - 0.5 <= rating ? 'text-amber-400' : 'text-muted-foreground/30';
      stars.push(
        <Star
          key={i}
          size={20}
          className={`${fill} transition-colors`}
          fill={i <= rating ? 'currentColor' : i - 0.5 <= rating ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            {sectionLabel}
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-3">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
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
              className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 w-full max-w-sm"
            >
              {/* Shield icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              {/* Platform name */}
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {badge.name}
              </span>

              {/* Score */}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-heading font-bold text-foreground">
                  {badge.score}
                </span>
                <span className="text-lg text-muted-foreground font-medium">
                  /{badge.maxScore}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-1">
                {renderStars(badge.stars)}
              </div>

              {/* Reviews count */}
              <span className="text-sm text-muted-foreground">
                Basado en <span className="font-semibold text-foreground">{badge.reviews} reseñas</span> verificadas
              </span>

              {/* Description */}
              <span className="text-xs text-muted-foreground">
                {badge.description}
              </span>

              {/* External link indicator */}
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver perfil <ExternalLink size={12} />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

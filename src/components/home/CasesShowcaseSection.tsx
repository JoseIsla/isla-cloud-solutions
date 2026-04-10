import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { casesApi, CaseFromAPI, API_BASE_URL } from "@/lib/api";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import BlurImage from "@/components/BlurImage";

const INTERVAL = 10_000;

const CasesShowcaseSection = () => {
  const t = useT();
  const { language } = useLanguage();
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    casesApi.list(language).then((data) => {
      setCases(data.filter((c) => c.is_active));
    }).catch(() => {});
  }, [language]);

  // Auto-rotate
  useEffect(() => {
    if (cases.length <= 1) return;
    const id = setInterval(() => setActive((p) => (p + 1) % cases.length), INTERVAL);
    return () => clearInterval(id);
  }, [cases.length]);

  const resolveImg = useCallback((url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  }, []);

  if (cases.length === 0) return null;

  const current = cases[active];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-[hsl(var(--hero-bg))]">
      {/* Background image with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <BlurImage
            src={resolveImg(current.image_url)}
            alt={current.title}
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
            noWebp
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--hero-bg))]/90 via-[hsl(var(--hero-bg))]/70 to-[hsl(var(--hero-bg))]/40" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[340px]">
          {/* Left: Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-primary" />
                <span className="text-primary text-sm font-bold uppercase tracking-widest">
                  {t("cases.label") || "Casos de Éxito"}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[hsl(var(--hero-foreground))] leading-tight">
                {current.title}
              </h2>

              {current.excerpt && (
                <p className="text-[hsl(var(--hero-foreground))]/70 text-lg leading-relaxed max-w-lg">
                  {current.excerpt}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-2">
                <Button asChild variant="hero" size="lg">
                  <Link to={`/casos/${current.slug || current.id}`}>
                    {t("cases.view_case") || "Ver caso"}
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild variant="heroOutline" size="lg">
                  <Link to="/casos">
                    {t("cases.view_all") || "Ver todos"}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: empty — image is full-bleed background */}
          <div className="hidden lg:block" />
        </div>

        {/* Dots indicator */}
        {cases.length > 1 && (
          <div className="flex justify-center lg:justify-start gap-2 mt-8">
            {cases.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-8 bg-primary"
                    : "w-2 bg-[hsl(var(--hero-foreground))]/30 hover:bg-[hsl(var(--hero-foreground))]/50"
                }`}
                aria-label={`Caso ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CasesShowcaseSection;

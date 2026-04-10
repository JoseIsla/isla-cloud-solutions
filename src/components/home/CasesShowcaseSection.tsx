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
    <section className="py-14 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-primary" />
            <span className="text-primary text-sm font-bold uppercase tracking-widest">
              {t("cases.label")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-10">
            {t("cases.title")}
          </h2>
        </motion.div>

        {/* Main showcase card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border shadow-lg min-h-[400px]"
        >
          {/* Left: Image */}
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <BlurImage
                  src={resolveImg(current.image_url)}
                  alt={current.title}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  noWebp
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center bg-card p-8 md:p-12 lg:p-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -30, filter: "blur(4px)" }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col gap-4"
              >
                {current.client_name && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="text-muted-foreground text-sm font-medium"
                  >
                    {t("cases.client")}: {current.client_name}
                  </motion.span>
                )}

                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                  className="text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight"
                >
                  {current.title}
                </motion.h3>

                {current.excerpt && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="text-muted-foreground text-base leading-relaxed"
                  >
                    {current.excerpt}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.45 }}
                  className="flex flex-wrap gap-3 mt-4"
                >
                  <Button asChild size="lg">
                    <Link to={`/casos/${current.slug || current.id}`}>
                      {t("cases.view_detail")}
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/casos">
                      Ver todos los casos
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Dots with progress */}
            {cases.length > 1 && (
              <div className="flex gap-2 mt-8">
                {cases.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
                    style={{ width: i === active ? 32 : 8 }}
                    aria-label={`Caso ${i + 1}`}
                  >
                    <span className={`absolute inset-0 rounded-full ${i === active ? "bg-primary/25" : "bg-border hover:bg-muted-foreground/40"}`} />
                    {i === active && (
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                        key={`progress-${active}`}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesShowcaseSection;

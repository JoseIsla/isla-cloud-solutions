import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { casesApi, CaseFromAPI, API_BASE_URL } from "@/lib/api";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { useCMSValue } from "@/hooks/useCMS";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BlurImage from "@/components/BlurImage";

const INTERVAL = 10_000;

const CasesShowcaseSection = () => {
  const t = useT();
  const { language } = useLanguage();
  const sectionLabel = useCMSValue("cases_section_label", t("cases.label"));
  const sectionTitle = useCMSValue("cases_section_title", t("cases.title"));
  const sectionSubtitle = useCMSValue(
    "cases_section_subtitle",
    "Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos."
  );
  const viewDetailBtn = useCMSValue("cases_view_detail_btn", t("cases.view_detail"));
  const viewAllBtn = useCMSValue("cases_view_all_btn", "Ver todos los casos");
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [active, setActive] = useState(0);
  const [manualKey, setManualKey] = useState(0);

  useEffect(() => {
    casesApi.list(language).then((data) => {
      setCases(data.filter((c) => c.is_active));
    }).catch(() => {});
  }, [language]);

  useEffect(() => {
    if (cases.length <= 1) return;
    const id = setInterval(() => setActive((p) => (p + 1) % cases.length), INTERVAL);
    return () => clearInterval(id);
  }, [cases.length, manualKey]);

  const goPrev = useCallback(() => {
    setActive((p) => (p - 1 + cases.length) % cases.length);
    setManualKey((k) => k + 1);
  }, [cases.length]);

  const goNext = useCallback(() => {
    setActive((p) => (p + 1) % cases.length);
    setManualKey((k) => k + 1);
  }, [cases.length]);

  const resolveImg = useCallback((url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  }, []);

  if (cases.length === 0) return null;

  const current = cases[active];

  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'hsl(var(--primary) / 0.06)',
              border: '1px solid hsl(var(--primary) / 0.12)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'hsl(var(--primary))' }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-medium"
              style={{ color: 'hsl(var(--primary))' }}
            >
              {sectionLabel}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-4 font-light tracking-wide max-w-2xl text-lg text-muted-foreground">
              {sectionSubtitle}
            </p>
          )}
        </motion.div>

        {/* Main showcase card */}
        <div className="relative group">
          {/* Navigation arrows */}
          {cases.length > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="Caso anterior"
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border) / 0.6)',
                  boxShadow: '0 8px 30px -8px hsl(var(--foreground) / 0.1)',
                }}
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <button
                onClick={goNext}
                aria-label="Caso siguiente"
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border) / 0.6)',
                  boxShadow: '0 8px 30px -8px hsl(var(--foreground) / 0.1)',
                }}
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[420px] rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted) / 0.5))',
              border: '1px solid hsl(var(--border) / 0.6)',
              boxShadow: '0 8px 40px -12px hsl(var(--foreground) / 0.08)',
            }}
          >
            {/* Left: Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
              {/* Top accent line on image */}
              <div
                className="absolute top-0 left-0 right-0 h-px z-10"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)',
                }}
              />
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
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14 relative">
              {/* Subtle hover glow */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none opacity-30"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)',
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -30, filter: "blur(4px)" }}
                  transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col gap-4 relative z-10"
                >
                  {current.client_name && (
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-medium"
                    >
                      {current.client_name}
                    </motion.span>
                  )}

                  <motion.h3
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                    className="text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight tracking-tight"
                  >
                    {current.title}
                  </motion.h3>

                  {current.excerpt && (
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.45 }}
                      className="text-muted-foreground text-base leading-relaxed font-light"
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
                    <Button asChild size="lg" className="rounded-xl">
                      <Link to={`/casos/${current.slug || current.id}`}>
                        {viewDetailBtn}
                        <ArrowRight size={18} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl">
                      <Link to="/casos">
                        {viewAllBtn}
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Dots with progress */}
              {cases.length > 1 && (
                <div className="flex gap-2 mt-8 relative z-10">
                  {cases.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setActive(i); setManualKey((k) => k + 1); }}
                      className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                      style={{ width: i === active ? 36 : 8 }}
                      aria-label={`Caso ${i + 1}`}
                    >
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: i === active
                            ? 'hsl(var(--primary) / 0.15)'
                            : 'hsl(var(--border))',
                        }}
                      />
                      {i === active && (
                        <motion.span
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ background: 'hsl(var(--primary))' }}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                          key={`progress-${active}-${manualKey}`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CasesShowcaseSection;

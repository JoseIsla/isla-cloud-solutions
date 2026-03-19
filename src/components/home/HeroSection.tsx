import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Newspaper, Trophy } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useCMSValue } from "@/hooks/useCMS";
import { newsApi, casesApi, type NewsFromAPI, type CaseFromAPI } from "@/lib/api";

const SLIDE_DURATION = 8000; // 8s per slide

interface SlideData {
  tabLabel: string;
  badge: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  ctaPrimary: { text: string; to: string };
  ctaSecondary?: { text: string; to: string };
}

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [latestNews, setLatestNews] = useState<NewsFromAPI | null>(null);
  const [currentCase, setCurrentCase] = useState<CaseFromAPI | null>(null);

  // CMS values for slide 1
  const title = useCMSValue('hero_title', 'Soluciones Cloud y Tecnología para Empresas');
  const subtitle = useCMSValue('hero_subtitle', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.');
  const ctaPrimary = useCMSValue('hero_cta_primary', 'Solicita información');
  const ctaSecondary = useCMSValue('hero_cta_secondary', 'Nuestros servicios');
  const badge = useCMSValue('hero_badge', 'Tu socio tecnológico de confianza');

  // Fetch latest published news
  useEffect(() => {
    newsApi.list().then((news) => {
      const published = news.filter((n) => n.is_published);
      if (published.length > 0) setLatestNews(published[0]);
    }).catch(() => {});
  }, []);

  // Fetch random active case
  useEffect(() => {
    casesApi.list().then((cases) => {
      const active = cases.filter((c: CaseFromAPI) => c.is_active);
      if (active.length > 0) {
        const random = active[Math.floor(Math.random() * active.length)];
        setCurrentCase(random);
      }
    }).catch(() => {});
  }, []);

  // Build slides
  const slides: SlideData[] = [
    {
      tabLabel: "Isla Cloud Solutions",
      badge,
      title,
      titleHighlight: "Tecnología",
      subtitle,
      ctaPrimary: { text: ctaPrimary, to: "/contacto" },
      ctaSecondary: { text: ctaSecondary, to: "/servicios" },
    },
    {
      tabLabel: "Último en el Blog",
      badge: latestNews?.category || "Blog",
      title: latestNews?.title || "Novedades en nuestro blog",
      subtitle: latestNews?.excerpt || "Descubre las últimas noticias y artículos sobre tecnología empresarial.",
      ctaPrimary: {
        text: "Leer artículo",
        to: latestNews ? `/blog/${latestNews.slug}` : "/blog",
      },
      ctaSecondary: { text: "Ver todo el blog", to: "/blog" },
    },
    {
      tabLabel: "Casos de Éxito",
      badge: currentCase?.client_name || "Caso de éxito",
      title: currentCase?.title || "Nuestros clientes hablan por nosotros",
      subtitle: currentCase?.excerpt || "Descubre cómo hemos ayudado a empresas como la tuya a crecer con tecnología.",
      ctaPrimary: { text: "Solicitar consulta", to: "/contacto" },
      ctaSecondary: { text: "Nuestros servicios", to: "/servicios" },
    },
  ];

  // Auto-advance timer with progress bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed % SLIDE_DURATION) / SLIDE_DURATION, 1);
      setProgress(pct);

      if (elapsed % SLIDE_DURATION < 50) {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [activeSlide, slides.length]);

  // Reset progress on manual tab click
  const handleTabClick = useCallback((index: number) => {
    setActiveSlide(index);
    setProgress(0);
  }, []);

  const currentSlideData = slides[activeSlide];

  // Highlight word in title
  const renderTitle = (slide: SlideData) => {
    if (slide.titleHighlight) {
      const parts = slide.title.split(slide.titleHighlight);
      if (parts.length > 1) {
        return (
          <>
            {parts[0]}
            <span className="text-gradient">{slide.titleHighlight}</span>
            {parts[1]}
          </>
        );
      }
    }
    return slide.title;
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Full-screen background */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-white/60 text-sm md:text-base font-body mb-4 uppercase tracking-wider">
                {currentSlideData.badge}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-heading font-bold text-white leading-[1.1] mb-8">
                {renderTitle(currentSlideData)}
              </h1>

              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed">
                {currentSlideData.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to={currentSlideData.ctaPrimary.to}>
                    {currentSlideData.ctaPrimary.text} <ArrowRight size={20} />
                  </Link>
                </Button>
                {currentSlideData.ctaSecondary && (
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                    asChild
                  >
                    <Link to={currentSlideData.ctaSecondary.to}>
                      {currentSlideData.ctaSecondary.text}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom tab bar - Devoteam style */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`flex-1 relative py-5 px-4 text-sm font-medium transition-colors duration-300 text-left ${
                  index === activeSlide
                    ? "text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <span className="hidden sm:inline">🏢</span>}
                  {index === 1 && <Newspaper size={16} className="hidden sm:inline shrink-0" />}
                  {index === 2 && <Trophy size={16} className="hidden sm:inline shrink-0" />}
                  <span className="truncate">{slide.tabLabel}</span>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                  {index === activeSlide && (
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.05, ease: "linear" }}
                    />
                  )}
                  {index < activeSlide && (
                    <div className="h-full bg-primary w-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

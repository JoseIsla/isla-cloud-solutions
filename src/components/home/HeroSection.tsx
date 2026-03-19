import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useCMSValue } from "@/hooks/useCMS";
import { newsApi, casesApi, type NewsFromAPI, type CaseFromAPI } from "@/lib/api";

const PROGRESS_DURATION = 8; // seconds for progress bar to fill

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
  const [progressKey, setProgressKey] = useState(0); // reset animation on tab change
  const [latestNews, setLatestNews] = useState<NewsFromAPI | null>(null);
  const [currentCase, setCurrentCase] = useState<CaseFromAPI | null>(null);

  // CMS values for slide 1
  const title = useCMSValue('hero_title', 'Soluciones Cloud y Tecnología para Empresas');
  const subtitle = useCMSValue('hero_subtitle', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.');
  const ctaPrimary = useCMSValue('hero_cta_primary', 'Solicita información');
  const ctaSecondary = useCMSValue('hero_cta_secondary', 'Nuestros servicios');
  const badge = useCMSValue('hero_badge', 'Tu socio tecnológico de confianza');

  useEffect(() => {
    newsApi.list().then((news) => {
      const published = news.filter((n) => n.is_published);
      if (published.length > 0) setLatestNews(published[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    casesApi.list().then((cases) => {
      const active = cases.filter((c: CaseFromAPI) => c.is_active);
      if (active.length > 0) {
        setCurrentCase(active[Math.floor(Math.random() * active.length)]);
      }
    }).catch(() => {});
  }, []);

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

  const handleTabClick = (index: number) => {
    if (index === activeSlide) return;
    setActiveSlide(index);
    setProgressKey((k) => k + 1); // restart progress animation
  };

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

  const currentSlideData = slides[activeSlide];

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background */}
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

      {/* Floating tab bar - Devoteam style */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div
            className="flex"
            style={{ gridTemplateColumns: `repeat(${slides.length}, 1fr)` }}
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`flex-1 relative py-4 px-6 text-sm md:text-base font-medium transition-colors duration-300 text-left cursor-pointer ${
                  index === activeSlide
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <span className="truncate block">{slide.tabLabel}</span>

                {/* Bottom progress line */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 rounded-full overflow-hidden">
                  {index === activeSlide && (
                    <motion.div
                      key={`progress-${progressKey}-${index}`}
                      className="h-full rounded-full"
                      style={{ background: "hsl(var(--primary))" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: PROGRESS_DURATION,
                        ease: "linear",
                      }}
                    />
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

/* hero-refresh */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import defaultHeroBg from "@/assets/hero-bg.webp";
import defaultHeroBlogBg from "@/assets/hero-blog-bg.webp";
import defaultHeroCasesBg from "@/assets/hero-cases-bg.webp";
import { useCMSValue } from "@/hooks/useCMS";
import { newsApi, casesApi, type NewsFromAPI, type CaseFromAPI } from "@/lib/api";

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
  const [latestNews, setLatestNews] = useState<NewsFromAPI | null>(null);
  const [currentCase, setCurrentCase] = useState<CaseFromAPI | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const title = useCMSValue('hero_title', 'Soluciones Cloud y Tecnología para Empresas');
  const subtitle = useCMSValue('hero_subtitle', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.');
  const ctaPrimary = useCMSValue('hero_cta_primary', 'Solicita información');
  const ctaSecondary = useCMSValue('hero_cta_secondary', 'Nuestros servicios');
  const badge = useCMSValue('hero_badge', 'Tu socio tecnológico de confianza');

  const heroBg1 = useCMSValue('hero_bg_slide1', '');
  const heroBg2 = useCMSValue('hero_bg_slide2', '');
  const heroBg3 = useCMSValue('hero_bg_slide3', '');
  const slideBackgrounds = [
    heroBg1 || defaultHeroBg,
    latestNews?.image_url || heroBg2 || defaultHeroBlogBg,
    currentCase?.image_url || heroBg3 || defaultHeroCasesBg,
  ];

  useEffect(() => {
    slideBackgrounds.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [slideBackgrounds[0], slideBackgrounds[1], slideBackgrounds[2]]);

  const tab1Label = useCMSValue('hero_tab1_label', 'Isla Cloud Solutions');
  const tab2Label = useCMSValue('hero_tab2_label', 'Último en el Blog');
  const tab3Label = useCMSValue('hero_tab3_label', 'Casos de Éxito');

  const slide2Fallback = useCMSValue('hero_slide2_title', 'Novedades en nuestro blog');
  const slide2FallbackDesc = useCMSValue('hero_slide2_subtitle', 'Descubre las últimas noticias y artículos sobre tecnología empresarial.');
  const slide2Cta = useCMSValue('hero_slide2_cta', 'Leer artículo');
  const slide2CtaSec = useCMSValue('hero_slide2_cta_secondary', 'Ver todo el blog');

  const slide3Fallback = useCMSValue('hero_slide3_title', 'Nuestros clientes hablan por nosotros');
  const slide3FallbackDesc = useCMSValue('hero_slide3_subtitle', 'Descubre cómo hemos ayudado a empresas como la tuya a crecer con tecnología.');
  const slide3Cta = useCMSValue('hero_slide3_cta', 'Solicitar consulta');
  const slide3CtaSec = useCMSValue('hero_slide3_cta_secondary', 'Nuestros servicios');

  useEffect(() => {
    newsApi.list().then((news) => {
      const published = news.filter((n) => n.is_published);
      if (published.length > 0) setLatestNews(published[0]);
    }).catch(() => {});
  }, []);

  const activeCasesRef = useRef<CaseFromAPI[]>([]);

  useEffect(() => {
    casesApi.list().then((cases) => {
      const active = cases.filter((c: CaseFromAPI) => c.is_active);
      activeCasesRef.current = active;
      if (active.length > 0) {
        setCurrentCase(active[Math.floor(Math.random() * active.length)]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeCasesRef.current.length < 2) return;
    const interval = setInterval(() => {
      const cases = activeCasesRef.current;
      setCurrentCase(prev => {
        const others = cases.filter(c => c.id !== prev?.id);
        return others[Math.floor(Math.random() * others.length)] || prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [currentCase]);

  const slides: SlideData[] = [
    {
      tabLabel: tab1Label,
      badge,
      title,
      titleHighlight: "Tecnología",
      subtitle,
      ctaPrimary: { text: ctaPrimary, to: "/contacto" },
      ctaSecondary: { text: ctaSecondary, to: "/servicios" },
    },
    {
      tabLabel: tab2Label,
      badge: latestNews?.category || "Blog",
      title: latestNews?.title || slide2Fallback,
      subtitle: latestNews?.excerpt || slide2FallbackDesc,
      ctaPrimary: {
        text: slide2Cta,
        to: latestNews ? `/blog/${latestNews.slug}` : "/blog",
      },
      ctaSecondary: { text: slide2CtaSec, to: "/blog" },
    },
    {
      tabLabel: tab3Label,
      badge: currentCase?.client_name || "Caso de éxito",
      title: currentCase?.title || slide3Fallback,
      subtitle: currentCase?.excerpt || slide3FallbackDesc,
      ctaPrimary: { text: "Ver caso de éxito", to: currentCase ? `/casos/${currentCase.slug || currentCase.id}` : "/contacto" },
      ctaSecondary: { text: slide3CtaSec, to: "/casos" },
    },
  ];




  const handleTabClick = (index: number) => {
    if (index === activeSlide) return;
    setActiveSlide(index);
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
    <section aria-label="Presentación principal" role="region" className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={activeSlide}
            src={slideBackgrounds[activeSlide]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              scale: 1.06,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: "easeOut" },
              scale: { duration: 14, ease: "linear" },
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20 lg:pt-24 flex justify-center">
        <div className="max-w-3xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                exit: { transition: { staggerChildren: 0.03 } },
              }}
            >
              <motion.div
                className="overflow-hidden mb-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
              >
                <motion.span
                  className="inline-block text-white/60 text-sm md:text-base font-body uppercase tracking-wider"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.2, ease: [0.5, 0, 0.75, 0] } },
                  }}
                >
                  {currentSlideData.badge}
                </motion.span>
              </motion.div>

              <motion.div
                className="overflow-hidden mb-8"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
              >
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-heading font-bold text-white leading-[1.1]"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.2, ease: [0.5, 0, 0.75, 0] } },
                  }}
                >
                  {renderTitle(currentSlideData)}
                </motion.h1>
              </motion.div>

              <motion.div
                className="overflow-hidden mb-10"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
              >
                <motion.p
                  className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.2, ease: [0.5, 0, 0.75, 0] } },
                  }}
                >
                  {currentSlideData.subtitle}
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
                  exit: { opacity: 0, y: -15, transition: { duration: 0.15 } },
                }}
              >
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
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <nav aria-label="Pestañas del slider" className="absolute bottom-6 md:bottom-12 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="mx-0 relative" ref={tabsContainerRef} role="tablist" aria-label="Secciones del hero">
            <div className="flex gap-2 md:gap-3">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  data-tab
                  role="tab"
                  aria-selected={index === activeSlide}
                  aria-label={`Ir a ${slide.tabLabel}`}
                  onClick={() => handleTabClick(index)}
                  className={`flex-1 py-3 px-2 md:py-5 md:px-6 text-xs md:text-base font-medium transition-colors duration-300 text-center cursor-pointer relative ${
                    index === activeSlide
                      ? "text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span className="truncate block">{slide.tabLabel}</span>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10" />
                  {index === activeSlide && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                      layoutId="hero-tab-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </section>
  );
};

export default HeroSection;

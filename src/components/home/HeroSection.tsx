import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import heroBlogBg from "@/assets/hero-blog-bg.jpg";
import heroCasesBg from "@/assets/hero-cases-bg.jpg";

const slideBackgrounds = [heroBg, heroBlogBg, heroCasesBg];
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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

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

  // Measure tab positions for the sliding indicator
  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      if (!container) return;
      const tabs = container.querySelectorAll<HTMLButtonElement>('[data-tab]');
      const tab = tabs[activeSlide];
      if (!tab) return;
      setIndicatorStyle({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
      });
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSlide]);

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
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background — per-slide image with zoom */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={activeSlide}
            src={slideBackgrounds[activeSlide]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
                exit: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {/* Badge */}
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
                    visible: { y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                  }}
                >
                  {currentSlideData.badge}
                </motion.span>
              </motion.div>

              {/* Title */}
              <motion.div
                className="overflow-hidden mb-8"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
              >
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-heading font-bold text-white leading-[1.1]"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                  }}
                >
                  {renderTitle(currentSlideData)}
                </motion.h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                className="overflow-hidden mb-10"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
              >
                <motion.p
                  className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
                    exit: { y: "-100%", transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                  }}
                >
                  {currentSlideData.subtitle}
                </motion.p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } },
                  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
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
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating tab bar — Devoteam style */}
      <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="mx-0 md:mx-16 lg:mx-24 relative" ref={tabsContainerRef}>
            {/* Background track line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10" />

            {/* Sliding indicator — spring bounce like Devoteam */}
            <motion.div
              className="absolute bottom-0 h-[3px]"
              style={{ background: "hsl(var(--primary))" }}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 1,
              }}
            />

            <div className="flex">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  data-tab
                  onClick={() => handleTabClick(index)}
                  className={`flex-1 py-3 px-2 md:py-5 md:px-6 text-xs md:text-base font-medium transition-colors duration-300 text-left cursor-pointer ${
                    index === activeSlide
                      ? "text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span className="truncate block">{slide.tabLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

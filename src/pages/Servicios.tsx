import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, type LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { services as fallbackServices } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import BlurImage from "@/components/BlurImage";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database,
};

const ServiciosPage = () => {
  const t = useT();
  const { language } = useLanguage();
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list(language)
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, [language]);

  const useApi = apiServices && apiServices.length > 0;

  const items = useMemo(() => {
    if (useApi) {
      return apiServices!.map(s => ({
        slug: s.slug,
        title: s.title,
        shortTitle: s.short_title,
        description: s.description,
        Icon: iconMap[s.icon] || Server,
        image: s.image || serviceImages[s.slug],
      }));
    }
    return fallbackServices.map(s => ({
      slug: s.slug,
      title: s.title,
      shortTitle: s.shortTitle,
      description: s.description,
      Icon: s.icon,
      image: serviceImages[s.slug],
    }));
  }, [useApi, apiServices]);

  const serviciosJsonLd = useMemo(() => {
    const listItems = items.map((s, i) => ({
      '@type': 'ListItem' as const,
      position: i + 1,
      url: `${SITE_URL}/servicios/${s.slug}`,
      name: s.title,
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${t('services_page.label')} | ${SITE_NAME}`,
      url: `${SITE_URL}/servicios`,
      description: t('services_page.subtitle'),
      mainEntity: { '@type': 'ItemList', numberOfItems: listItems.length, itemListElement: listItems },
    };
  }, [items, t]);

  usePageMeta({
    title: t('services_page.label'),
    description: t('services_page.subtitle'),
    canonical: '/servicios',
    jsonLd: serviciosJsonLd,
  });

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // Pick a background image from the first service
  const bgImage = items[0]?.image;

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t('breadcrumb.home'), path: '/' }, { name: t('services_page.label'), path: '/servicios' }]} />
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t('services_page.label')}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
            {useCMSValue('services_page_title', '') || t('services_page.title')}
          </h1>
          <p className="text-hero-foreground/70 text-lg">
            {useCMSValue('services_page_subtitle', '') || t('services_page.subtitle')}
          </p>
        </motion.div>
      </ParallaxHero>

      {/* Slider Section - Ntiva-inspired */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          {bgImage && (
            <BlurImage
              src={bgImage}
              alt=""
              className="h-full w-full object-cover"
              wrapperClassName="h-full w-full"
              placeholderColor="#0a1628"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-bg)/0.92)] via-[hsl(var(--hero-bg)/0.88)] to-[hsl(var(--hero-bg)/0.95)]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28 lg:py-32">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16 max-w-2xl"
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--hero-foreground))] leading-tight">
              {useCMSValue('services_slider_title', '') || t('services_page.title')}
            </h2>
            <p className="mt-4 text-[hsl(var(--hero-foreground)/0.65)] text-lg max-w-xl">
              {useCMSValue('services_slider_subtitle', '') || t('services_page.subtitle')}
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-5">
              {items.map((service, index) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="flex-[0_0_85%] min-w-0 sm:flex-[0_0_48%] md:flex-[0_0_36%] lg:flex-[0_0_28%] xl:flex-[0_0_23%]"
                >
                  <Link
                    to={`/servicios/${service.slug}`}
                    className="group flex flex-col justify-between h-full min-h-[280px] md:min-h-[320px] rounded-2xl p-6 md:p-7
                      bg-[hsl(var(--services-card-surface))] border border-[hsl(var(--services-card-border))]
                      backdrop-blur-[18px] shadow-[0_18px_60px_hsl(var(--hero-bg)/0.22)]
                      hover:bg-[hsl(var(--services-card-surface-hover))] hover:border-[hsl(var(--services-card-border-hover))]
                      hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.12)] flex items-center justify-center mb-5
                        group-hover:bg-[hsl(var(--primary)/0.2)] transition-colors duration-300">
                        <service.Icon size={24} className="text-[hsl(var(--services-foreground-soft))] group-hover:text-primary transition-colors duration-300" />
                      </div>
                      <h3 className="text-[hsl(var(--services-foreground-strong))] font-heading font-semibold text-lg md:text-xl mb-3 leading-tight">
                        {service.shortTitle}
                      </h3>
                      <p className="text-[hsl(var(--services-foreground-soft))] text-sm leading-relaxed line-clamp-4">
                        {service.description}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-primary text-sm font-medium mt-5 group-hover:gap-2.5 transition-all duration-300">
                      {t('services_page.view_detail')} <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 md:mt-10">
            {/* Dots */}
            <div className="flex gap-2">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === selectedIndex
                      ? "bg-[hsl(var(--hero-foreground))] scale-110"
                      : "bg-[hsl(var(--hero-foreground)/0.3)] hover:bg-[hsl(var(--hero-foreground)/0.5)]"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                className="w-11 h-11 rounded-xl border border-[hsl(var(--hero-foreground)/0.2)] flex items-center justify-center
                  text-[hsl(var(--hero-foreground)/0.6)] hover:text-[hsl(var(--hero-foreground))] hover:border-[hsl(var(--hero-foreground)/0.4)]
                  transition-all duration-200 cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="w-11 h-11 rounded-xl border border-[hsl(var(--hero-foreground)/0.2)] flex items-center justify-center
                  text-[hsl(var(--hero-foreground)/0.6)] hover:text-[hsl(var(--hero-foreground))] hover:border-[hsl(var(--hero-foreground)/0.4)]
                  transition-all duration-200 cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiciosPage;

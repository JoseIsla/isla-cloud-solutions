import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, type LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { services as fallbackServices } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import { useT, useLanguage } from "@/i18n/LanguageContext";
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
        image: s.image_url || serviceImages[s.slug],
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

  // Rotate items so the carousel visually starts from the middle
  const rotatedItems = useMemo(() => {
    if (items.length <= 2) return items;
    const mid = Math.floor(items.length / 2);
    return [...items.slice(mid), ...items.slice(0, mid)];
  }, [items]);

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    loop: true,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);


  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t('breadcrumb.home'), path: '/' }, { name: t('services_page.label'), path: '/servicios' }]} />
      <section className="bg-hero grid-pattern py-14 md:py-16 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-primary text-sm font-semibold uppercase tracking-wider inline-block"
            >
              {t('services_page.label')}
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-4">
              {useCMSValue('services_page_title', '') || t('services_page.title')}
            </h1>
            <p className="text-hero-foreground/70 text-lg">
              {useCMSValue('services_page_subtitle', '') || t('services_page.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Slider Section */}
      <section className="bg-background py-10 md:py-14 lg:py-16">
        {/* Carousel - bleeds to screen edges */}
        <div className="overflow-hidden" style={{ marginLeft: '-8%' }}>
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-4 md:-ml-5">
              {rotatedItems.map((service, index) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.07,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex-[0_0_85%] min-w-0 pl-4 md:pl-5 sm:flex-[0_0_48%] md:flex-[0_0_36%] lg:flex-[0_0_28%] xl:flex-[0_0_23%]"
                >
                  <Link
                    to={`/servicios/${service.slug}`}
                    className="group relative flex flex-col justify-between h-full min-h-[280px] md:min-h-[320px] rounded-2xl p-6 md:p-7
                      bg-[hsl(var(--services-card-surface))] backdrop-blur-[18px]
                      border border-[hsl(var(--services-card-border))]
                      shadow-lg shadow-black/10
                      hover:bg-[hsl(var(--services-card-surface-hover))]
                      hover:border-[hsl(var(--services-card-border-hover))]
                      hover:shadow-xl hover:shadow-primary/10
                      transition-all duration-300 overflow-hidden"
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0
                      group-hover:from-primary/5 group-hover:via-transparent group-hover:to-primary/3
                      transition-all duration-500 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5
                        group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300">
                        <service.Icon size={24} className="text-[hsl(var(--services-foreground-soft))] group-hover:text-primary transition-colors duration-300" />
                      </div>
                      <h3 className="text-[hsl(var(--services-foreground-strong))] font-heading font-semibold text-lg md:text-xl mb-3 leading-tight
                        group-hover:text-primary transition-colors duration-300">
                        {service.shortTitle}
                      </h3>
                      <p className="text-[hsl(var(--services-foreground-soft))] text-sm leading-relaxed line-clamp-4">
                        {service.description}
                      </p>
                    </div>
                    <span className="relative z-10 flex items-center gap-1.5 text-primary text-sm font-medium mt-5
                      group-hover:gap-2.5 transition-all duration-300">
                      {t('services_page.view_detail')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-end mt-8 md:mt-10"
          >
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                className="w-11 h-11 rounded-xl border border-border flex items-center justify-center
                  text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5
                  active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="w-11 h-11 rounded-xl border border-border flex items-center justify-center
                  text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5
                  active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiciosPage;

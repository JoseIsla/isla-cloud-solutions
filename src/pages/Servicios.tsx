import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, type LucideIcon } from "lucide-react";

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

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t('breadcrumb.home'), path: '/' }, { name: t('services_page.label'), path: '/servicios' }]} />

      {/* Hero */}
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

      {/* Services Grid */}
      <section className="bg-background py-10 md:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {items.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.06,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  to={`/servicios/${service.slug}`}
                  className="group flex items-center gap-4 md:gap-5 rounded-xl
                    bg-card/65 backdrop-blur-xl
                    border border-border/80
                    p-4 md:p-5
                    shadow-[0_2px_12px_hsl(var(--foreground)/0.02),inset_0_1px_1px_hsl(0_0%_100%/0.6)]
                    hover:bg-card/90 hover:border-primary/25
                    hover:shadow-[0_8px_32px_hsl(var(--primary)/0.08)]
                    hover:-translate-y-0.5
                    transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg
                    bg-card/50 border border-border/60
                    flex items-center justify-center
                    group-hover:bg-primary/10 group-hover:border-primary/20
                    transition-all duration-300">
                    <service.Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm md:text-[15px] text-foreground
                      group-hover:text-primary transition-colors duration-300 leading-tight truncate">
                      {service.shortTitle}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm mt-0.5 truncate">
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-muted-foreground/50
                    group-hover:text-primary transition-colors duration-300">
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiciosPage;

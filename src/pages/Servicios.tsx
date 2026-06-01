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

      {/* Hero — same as before */}
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-title-gradient mt-3 mb-4">
              {useCMSValue('services_page_title', '') || t('services_page.title')}
            </h1>
            <p className="text-hero-foreground/70 text-lg">
              {useCMSValue('services_page_subtitle', '') || t('services_page.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid — Premium glassmorphism image cards */}
      <section className="bg-background py-10 md:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {items.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.06,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  to={`/servicios/${service.slug}`}
                  className="group relative block h-[380px] md:h-[420px] rounded-2xl overflow-hidden
                    ring-1 ring-border/60 shadow-lg
                    transition-all duration-700 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Background image */}
                  <div className="absolute inset-0 bg-muted">
                    {service.image ? (
                      <BlurImage
                        src={service.image}
                        alt={service.title}
                        placeholderColor="hsl(var(--muted))"
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        wrapperClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <service.Icon size={48} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Default state: title at bottom with gradient */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-opacity duration-500 group-hover:opacity-0 z-10"
                    style={{
                      background: 'linear-gradient(to top, hsl(var(--hero-bg) / 0.85), hsl(var(--hero-bg) / 0.4) 60%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'hsl(var(--primary) / 0.15)',
                          border: '1px solid hsl(var(--primary) / 0.25)',
                        }}
                      >
                        <service.Icon size={18} className="text-primary" />
                      </div>
                      <h3 className="text-lg md:text-xl font-heading font-semibold text-white">
                        {service.shortTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Hover state: frosted glass overlay */}
                  <div
                    className="absolute inset-3 rounded-xl flex flex-col p-6 md:p-8 z-20
                      opacity-0 translate-y-8
                      group-hover:translate-y-0 group-hover:opacity-100
                      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{
                      background: 'hsl(var(--card) / 0.82)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: 'inset 0 1px 1px hsl(0 0% 100% / 0.15), 0 8px 32px hsl(var(--foreground) / 0.08)',
                      border: '1px solid hsl(var(--border) / 0.6)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        {service.shortTitle}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground tracking-tight mb-3">
                      {service.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                      {service.description}
                    </p>

                    <div
                      className="mt-auto flex items-center justify-between pt-5"
                      style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
                    >
                      <span className="text-primary font-medium text-sm">
                        {t('services_page.view_detail') || 'Ver servicio'}
                      </span>
                      <ArrowRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
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

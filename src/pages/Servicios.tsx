import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, type LucideIcon } from "lucide-react";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { services as fallbackServices } from "@/data/services";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import { useT } from "@/i18n/LanguageContext";
import { useEffect, useState, useMemo } from "react";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database,
};

const ServiciosPage = () => {
  const t = useT();
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list()
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, []);

  const useApi = apiServices && apiServices.length > 0;

  const serviciosJsonLd = useMemo(() => {
    const items = useApi
      ? apiServices!.map((s, i) => ({ '@type': 'ListItem' as const, position: i + 1, url: `${SITE_URL}/servicios/${s.slug}`, name: s.title }))
      : fallbackServices.map((s, i) => ({ '@type': 'ListItem' as const, position: i + 1, url: `${SITE_URL}/servicios/${s.slug}`, name: s.title }));
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${t('services_page.label')} | ${SITE_NAME}`,
      url: `${SITE_URL}/servicios`,
      description: t('services_page.subtitle'),
      mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items },
    };
  }, [useApi, apiServices, t]);

  usePageMeta({
    title: t('services_page.label'),
    description: t('services_page.subtitle'),
    canonical: '/servicios',
    jsonLd: serviciosJsonLd,
  });

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

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useApi
              ? apiServices!.map((service, index) => {
                  const Icon = iconMap[service.icon] || Server;
                  return (
                    <motion.div key={service.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                      <Link to={`/servicios/${service.slug}`}
                        className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                          <Icon size={28} className="text-primary" />
                        </div>
                        <h2 className="font-heading font-semibold text-xl text-card-foreground mb-3">{service.title}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-5">{service.description}</p>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('services_page.view_detail')} <ArrowRight size={14} />
                        </span>
                      </Link>
                    </motion.div>
                  );
                })
              : fallbackServices.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div key={service.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                      <Link to={`/servicios/${service.slug}`}
                        className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                          <Icon size={28} className="text-primary" />
                        </div>
                        <h2 className="font-heading font-semibold text-xl text-card-foreground mb-3">{service.title}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-5">{service.description}</p>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('services_page.view_detail')} <ArrowRight size={14} />
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiciosPage;

import { useParams, Link } from "react-router-dom";
import BlurImage from "@/components/BlurImage";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { services as fallbackServices } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { sanitizeHTML } from "@/lib/sanitize";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database,
};

const ServicioDetalle = () => {
  const { slug } = useParams();
  const [apiService, setApiService] = useState<ServiceFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    servicesApi.get(slug)
      .then((data) => { setApiService(data); setLoading(false); })
      .catch(() => { setApiError(true); setLoading(false); });
  }, [slug]);

  const fallback = fallbackServices.find((s) => s.slug === slug);
  const useApi = apiService && !apiError;

  // Normalize data before hooks so hooks always run
  const title = useApi ? apiService!.title : (fallback?.title ?? '');
  const description = useApi ? apiService!.description : (fallback?.description ?? '');
  const longDescription = useApi ? apiService!.long_description : (fallback?.longDescription ?? '');
  const features = useApi ? (apiService!.features || []) : (fallback?.features ?? []);
  const iconName = useApi ? apiService!.icon : '';
  const Icon = useApi ? (iconMap[iconName] || Server) : (fallback?.icon ?? Server);
  const imageUrl = useApi ? apiService!.image_url : (fallback ? serviceImages[fallback.slug] : '');

  const serviceJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/servicios/${slug}`,
    ...(useApi && apiService!.image_url ? { image: apiService!.image_url } : {}),
    areaServed: { '@type': 'Country', name: 'España' },
  }), [title, description, slug, useApi, apiService]);

  usePageMeta({
    title: title || 'Servicio',
    description: description || '',
    canonical: `/servicios/${slug}`,
    ogImage: useApi ? apiService!.image_url : undefined,
    jsonLd: serviceJsonLd,
  });

  const breadcrumbs = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: title || 'Servicio', path: `/servicios/${slug}` },
  ], [title, slug]);

  if (loading) {
    return (
      <Layout>
        <section className="bg-hero grid-pattern py-24">
          <div className="container mx-auto px-4">
            <div className="h-3 w-28 bg-hero-foreground/10 rounded animate-pulse mb-8" />
            <div className="max-w-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-hero-foreground/10 animate-pulse" />
              <div className="h-10 w-2/3 bg-hero-foreground/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-hero-foreground/10 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-hero-foreground/10 rounded animate-pulse" />
            </div>
          </div>
        </section>
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl bg-muted aspect-video animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
              <div className="p-8 rounded-2xl bg-card border border-border space-y-4">
                <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
                {[1,2,3,4].map(i => <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />)}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!useApi && !fallback) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Servicio no encontrado</h1>
          <Button variant="default" className="mt-6" asChild>
            <Link to="/servicios">Volver a servicios</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <section className="relative bg-hero grid-pattern py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/servicios" className="inline-flex items-center gap-2 text-primary text-sm mb-8 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Todos los servicios
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Icon size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mb-6">
              {title}
            </h1>
            <p className="text-hero-foreground/70 text-lg leading-relaxed">{description}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              {imageUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <BlurImage
                    src={imageUrl}
                    alt={title}
                    className="w-full rounded-2xl object-cover aspect-video shadow-lg"
                    wrapperClassName="w-full rounded-2xl overflow-hidden aspect-video"
                  />
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Descripción del servicio</h2>
                {useApi ? (
                  <div
                    className="text-muted-foreground leading-relaxed text-lg prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(longDescription) }}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-lg">{longDescription}</p>
                )}
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-card border border-border sticky top-28"
              >
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-6">Características</h3>
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="hero" size="lg" className="w-full mt-8" asChild>
                  <Link to="/contacto">Solicitar información</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicioDetalle;

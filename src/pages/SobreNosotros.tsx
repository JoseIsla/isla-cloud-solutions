import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Award, Users } from "lucide-react";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CTASection from "@/components/home/CTASection";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";
import { useT } from "@/i18n/LanguageContext";

const icons = [Shield, Clock, Award, Users];

const SobreNosotros = () => {
  const t = useT();

  const aboutJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `${t('about.label')} | ${SITE_NAME}`,
    url: `${SITE_URL}/sobre-nosotros`,
    description: t('about.subtitle'),
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      foundingDate: '2004',
    },
  }), [t]);

  usePageMeta({
    title: t('about.label'),
    description: t('about.subtitle'),
    canonical: '/sobre-nosotros',
    jsonLd: aboutJsonLd,
  });

  const title = useCMSValue('about_title', '') || t('about.title');
  const subtitle = useCMSValue('about_subtitle', '') || t('about.subtitle');
  const history = useCMSValue('about_history', '<p>Isla Cloud Solutions nació con la misión de proporcionar servicios tecnológicos de primer nivel a empresas que necesitan un socio de confianza para gestionar su infraestructura IT.</p><p>Con más de 20 años de experiencia en el sector, nuestro equipo de ingenieros y técnicos especializados ha gestionado la infraestructura de empresas de todos los sectores, desde instituciones culturales de prestigio internacional hasta empresas de innovación tecnológica.</p><p>Nuestro compromiso es claro: ser el departamento IT que tu empresa necesita, con la profesionalidad y la cercanía de un equipo que trabaja integrado en tu organización.</p>');

  const values = [
    { title: useCMSValue('whyus_reason_1_title', '') || t('about.value1_title'), description: useCMSValue('whyus_reason_1_desc', '') || t('about.value1_desc') },
    { title: useCMSValue('whyus_reason_2_title', '') || t('about.value2_title'), description: useCMSValue('whyus_reason_2_desc', '') || t('about.value2_desc') },
    { title: useCMSValue('whyus_reason_3_title', '') || t('about.value3_title'), description: useCMSValue('whyus_reason_3_desc', '') || t('about.value3_desc') },
    { title: useCMSValue('whyus_reason_4_title', '') || t('about.value4_title'), description: useCMSValue('whyus_reason_4_desc', '') || t('about.value4_desc') },
  ];

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t('breadcrumb.home'), path: '/' }, { name: t('about.label'), path: '/sobre-nosotros' }]} />
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t('about.label')}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">{title}</h1>
          <p className="text-hero-foreground/70 text-lg">{subtitle}</p>
        </motion.div>
      </ParallaxHero>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-8">{useCMSValue('about_history_title', '') || t('about.history_title')}</h2>
              <div
                className="space-y-6 text-muted-foreground leading-relaxed prose prose-p:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(history) }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl font-heading font-bold text-foreground text-center mb-16">
            {useCMSValue('about_values_title', '') || t('about.values_title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = icons[index];
              return (
                <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-card border border-border">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default SobreNosotros;

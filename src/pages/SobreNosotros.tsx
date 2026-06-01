import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Shield, Clock, Sparkles, Users, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";
import { useT } from "@/i18n/LanguageContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const SobreNosotros = () => {
  const t = useT();

  const aboutJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `${t("about.label")} | ${SITE_NAME}`,
      url: `${SITE_URL}/sobre-nosotros`,
      description: t("about.subtitle"),
      mainEntity: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        foundingDate: "2004",
      },
    }),
    [t],
  );

  usePageMeta({
    title: t("about.label"),
    description: t("about.subtitle"),
    canonical: "/sobre-nosotros",
    jsonLd: aboutJsonLd,
  });

  const title = useCMSValue("about_title", "") || t("about.title");
  const subtitle = useCMSValue("about_subtitle", "") || t("about.subtitle");
  const history = useCMSValue(
    "about_history",
    "<p>Isla Cloud Solutions nació en 2018 conjuntando profesionales del mundo IT con más de 25 años de experiencia.</p>",
  );
  const historyTitle = useCMSValue("about_history_title", "") || t("about.history_title");
  const historyImage = useCMSValue("about_history_image", "");
  const valuesTitle = useCMSValue("about_values_title", "") || t("about.values_title");
  const valuesSubtitle = useCMSValue("about_values_subtitle", "La base sobre la que construimos cada infraestructura");

  const stats = [
    { value: useCMSValue("about_stat1_value", "+25"), label: useCMSValue("about_stat1_label", "Años de Experiencia") },
    { value: useCMSValue("about_stat2_value", "2018"), label: useCMSValue("about_stat2_label", "Año de Fundación") },
    { value: useCMSValue("about_stat3_value", "35%"), label: useCMSValue("about_stat3_label", "Crecimiento Anual") },
    { value: useCMSValue("about_stat4_value", "65%"), label: useCMSValue("about_stat4_label", "Nuevos Clientes") },
  ];

  const pillars = [
    {
      title: useCMSValue("about_pillar1_title", "Visión Estratégica"),
      desc: useCMSValue("about_pillar1_desc", ""),
      accent: false,
    },
    {
      title: useCMSValue("about_pillar2_title", "Cercanía Real"),
      desc: useCMSValue("about_pillar2_desc", ""),
      accent: true,
    },
  ];

  const valueIcons = [Shield, Clock, Sparkles, Users];
  const values = [
    { title: useCMSValue("whyus_reason_1_title", "") || t("about.value1_title"), description: useCMSValue("whyus_reason_1_desc", "") || t("about.value1_desc") },
    { title: useCMSValue("whyus_reason_2_title", "") || t("about.value2_title"), description: useCMSValue("whyus_reason_2_desc", "") || t("about.value2_desc") },
    { title: useCMSValue("whyus_reason_3_title", "") || t("about.value3_title"), description: useCMSValue("whyus_reason_3_desc", "") || t("about.value3_desc") },
    { title: useCMSValue("whyus_reason_4_title", "") || t("about.value4_title"), description: useCMSValue("whyus_reason_4_desc", "") || t("about.value4_desc") },
  ];

  const ctaTitle = useCMSValue("about_cta_title", "¿Listo para escalar tu infraestructura?");
  const ctaSubtitle = useCMSValue("about_cta_subtitle", "");
  const ctaButton = useCMSValue("about_cta_button", "Solicitar consultoría gratuita");

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t("breadcrumb.home"), path: "/" }, { name: t("about.label"), path: "/sobre-nosotros" }]} />

      {/* Hero — coherente con Casos/Servicios */}
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">{title}</h1>
          <p className="text-hero-foreground/70 text-lg">{subtitle}</p>
        </motion.div>
      </ParallaxHero>

      {/* Stats */}
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary/30 transition-colors duration-300"
              >
                <div className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">{s.value}</div>
                <div className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border aspect-video bg-card flex items-center justify-center">
                {historyImage ? (
                  <img
                    src={historyImage}
                    alt={historyTitle}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <Building2 className="w-32 h-32 text-primary/40 relative" strokeWidth={1} />
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="order-1 lg:order-2 space-y-5"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{historyTitle}</h2>
              <div
                className="text-muted-foreground text-base md:text-lg leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(history) }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="bg-background pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                className="rounded-2xl border border-border bg-card p-8 md:p-10 hover:border-primary/30 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    p.accent ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                  }`}
                >
                  {p.accent ? <Users className="w-6 h-6" strokeWidth={1.75} /> : <Shield className="w-6 h-6" strokeWidth={1.75} />}
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-background pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="max-w-2xl"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3 mb-4">{valuesTitle}</h2>
            <p className="text-muted-foreground text-lg">{valuesSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <motion.div
                  key={v.title}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                  className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary/30 transition-colors duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-primary transition-transform group-hover:scale-110" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-lg font-heading font-semibold text-foreground mb-2">{v.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero py-20 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-hero-foreground leading-tight">
              {ctaTitle}
            </h2>
            {ctaSubtitle && (
              <p className="text-hero-foreground/70 text-base md:text-lg max-w-2xl mx-auto">{ctaSubtitle}</p>
            )}
            <div className="pt-2">
              <Button variant="hero" size="xl" asChild className="shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)]">
                <Link to="/contacto">
                  {ctaButton}
                  <ArrowRight size={20} />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default SobreNosotros;

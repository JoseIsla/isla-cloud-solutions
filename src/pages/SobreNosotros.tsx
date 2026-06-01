import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Sparkles, Users, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";
import { useT } from "@/i18n/LanguageContext";

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
  const valuesTitle = useCMSValue("about_values_title", "") || t("about.values_title");
  const valuesSubtitle = useCMSValue("about_values_subtitle", "La base sobre la que construimos cada infraestructura");

  const stats = [
    { value: useCMSValue("about_stat1_value", "+25"), label: useCMSValue("about_stat1_label", "Años de Experiencia"), desc: useCMSValue("about_stat1_desc", "") },
    { value: useCMSValue("about_stat2_value", "2018"), label: useCMSValue("about_stat2_label", "Año de Fundación"), desc: useCMSValue("about_stat2_desc", "") },
    { value: useCMSValue("about_stat3_value", "35%"), label: useCMSValue("about_stat3_label", "Crecimiento Anual"), desc: useCMSValue("about_stat3_desc", "") },
    { value: useCMSValue("about_stat4_value", "65%"), label: useCMSValue("about_stat4_label", "Nuevos Clientes"), desc: useCMSValue("about_stat4_desc", "") },
  ];

  const pillars = [
    { title: useCMSValue("about_pillar1_title", "Visión Estratégica"), desc: useCMSValue("about_pillar1_desc", ""), accent: false },
    { title: useCMSValue("about_pillar2_title", "Cercanía Real"), desc: useCMSValue("about_pillar2_desc", ""), accent: true },
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

      {/* Hero — consistente con Servicios / Casos / Blog */}
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">{title}</h1>
          <p className="text-hero-foreground/70 text-lg">{subtitle}</p>
        </motion.div>
      </ParallaxHero>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                className="rounded-2xl bg-card border border-border p-6 md:p-7 hover:border-primary/30 transition-colors duration-300"
              >
                <div className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-1">{s.value}</div>
                <div className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">{s.label}</div>
                {s.desc && <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia + Pilares */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-5"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{historyTitle}</h2>
              <div
                className="text-muted-foreground text-base md:text-lg leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(history) }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="rounded-2xl bg-card border border-border p-8 md:p-10">
                <div className="space-y-10">
                  {pillars.map((p, idx) => (
                    <div key={idx} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${p.accent ? "bg-accent ring-4 ring-accent/20" : "bg-primary ring-4 ring-primary/20"}`} />
                        {idx < pillars.length - 1 && <div className="w-0.5 flex-1 min-h-12 bg-border mt-2" />}
                      </div>
                      <div className="pb-2">
                        <h3 className="text-foreground font-heading font-semibold text-lg md:text-xl">{p.title}</h3>
                        <p className="text-muted-foreground mt-1 leading-relaxed text-sm md:text-base">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-3"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t("about.label")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{valuesTitle}</h2>
            <p className="text-muted-foreground">{valuesSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = valueIcons[i];
              const isAccent = i % 2 === 1;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                  className="group rounded-2xl bg-card border border-border p-7 hover:border-primary/30 transition-colors duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                      isAccent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-hero grid-pattern border border-border p-10 md:p-16 text-center"
          >
            <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div aria-hidden className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground leading-tight">
                {ctaTitle}
              </h2>
              {ctaSubtitle && <p className="text-hero-foreground/70 text-base md:text-lg">{ctaSubtitle}</p>}
              <div className="pt-3">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                >
                  {ctaButton}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default SobreNosotros;

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Sparkles, Users, ArrowRight, Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";
import { useT } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
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

  const badge = useCMSValue("about_hero_badge", "") || t("about.label");
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

  // Split title in two halves for gradient effect
  const words = title.split(" ");
  const splitIdx = Math.ceil(words.length / 2);
  const titleFirst = words.slice(0, splitIdx).join(" ");
  const titleSecond = words.slice(splitIdx).join(" ");

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t("breadcrumb.home"), path: "/" }, { name: t("about.label"), path: "/sobre-nosotros" }]} />

      <div className="relative bg-hero text-hero-foreground overflow-hidden">
        {/* Decorative grid + radial mask */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary) / 0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.25) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
        <div aria-hidden className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 space-y-24 md:space-y-32 py-20 md:py-28">
          {/* Hero */}
          <motion.header
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-center max-w-4xl mx-auto space-y-7"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-semibold tracking-widest uppercase">
              {badge}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-hero-foreground leading-[1.05]">
              {titleFirst}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {titleSecond}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-hero-foreground/70 leading-relaxed font-light max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.header>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group p-6 md:p-8 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl hover:border-primary/40 transition-colors duration-300"
              >
                <div className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground mb-2">{s.value}</div>
                <div className="text-xs md:text-sm text-accent font-medium uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* History */}
          <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="relative order-2 lg:order-1"
            >
              <div aria-hidden className="absolute -inset-4 bg-gradient-to-br from-primary to-accent opacity-20 blur-2xl rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <Building2 className="w-32 h-32 text-primary/40 relative" strokeWidth={1} />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="order-1 lg:order-2 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground">{historyTitle}</h2>
              <div
                className="text-hero-foreground/70 text-base md:text-lg leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:text-hero-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(history) }}
              />
            </motion.div>
          </section>

          {/* Pilares */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 transition-colors hover:border-white/20"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    p.accent ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                  }`}
                >
                  {p.accent ? <Users className="w-6 h-6" strokeWidth={1.75} /> : <Shield className="w-6 h-6" strokeWidth={1.75} />}
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-hero-foreground mb-3">{p.title}</h3>
                <p className="text-hero-foreground/70 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Valores */}
          <section className="space-y-12">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="text-center max-w-2xl mx-auto space-y-4"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-hero-foreground">{valuesTitle}</h2>
              <p className="text-hero-foreground/70">{valuesSubtitle}</p>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    whileHover={{ y: -4 }}
                    className="group p-6 md:p-8 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-primary/40 transition-all duration-300 text-center"
                  >
                    <Icon className="w-10 h-10 text-primary mx-auto mb-5 transition-transform group-hover:scale-110" strokeWidth={1.75} />
                    <h4 className="text-lg font-heading font-semibold text-hero-foreground mb-2">{v.title}</h4>
                    <p className="text-sm text-hero-foreground/65 leading-relaxed">{v.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="py-16 md:py-20 text-center relative"
          >
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary/15 to-accent/15 blur-3xl rounded-[4rem] pointer-events-none" />
            <div className="relative space-y-7 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-hero-foreground leading-tight">
                {ctaTitle}
              </h2>
              {ctaSubtitle && (
                <p className="text-hero-foreground/70 text-base md:text-lg max-w-2xl mx-auto">{ctaSubtitle}</p>
              )}
              <div className="pt-2">
                <Link
                  to="/contacto"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold transition-all shadow-lg shadow-primary/25"
                >
                  {ctaButton}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default SobreNosotros;

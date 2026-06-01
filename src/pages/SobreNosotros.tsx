import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Sparkles, Users, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";
import { useT } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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

  const badge = useCMSValue("about_hero_badge", "Nuestra Identidad");
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
    { title: useCMSValue("about_pillar1_title", "Visión Estratégica"), desc: useCMSValue("about_pillar1_desc", ""), color: "primary" as const },
    { title: useCMSValue("about_pillar2_title", "Cercanía Real"), desc: useCMSValue("about_pillar2_desc", ""), color: "accent" as const },
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

      <div className="bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-24 md:space-y-32">
          {/* Hero */}
          <section className="relative">
            <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
            <div aria-hidden className="absolute top-20 right-0 w-80 h-80 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative z-10 max-w-3xl"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-accent text-xs font-bold tracking-widest uppercase mb-8"
              >
                {badge}
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-foreground leading-[0.9]"
              >
                {title.split(" ").slice(0, Math.ceil(title.split(" ").length / 2)).join(" ")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {title.split(" ").slice(Math.ceil(title.split(" ").length / 2)).join(" ")}
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-10 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl border-l-2 border-primary pl-6 md:pl-8"
              >
                {subtitle}
              </motion.p>
            </motion.div>
          </section>

          {/* Stats */}
          <section aria-label="Cifras clave" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="group relative p-8 rounded-3xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="text-4xl font-heading font-bold text-foreground mb-1">{s.value}</div>
                <div className="text-sm font-bold text-accent uppercase tracking-tight">{s.label}</div>
                {s.desc && <div className="text-xs text-muted-foreground mt-2">{s.desc}</div>}
              </motion.div>
            ))}
          </section>

          {/* History + Pillars */}
          <section className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="lg:col-span-5 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{historyTitle}</h2>
              <div
                className="text-muted-foreground text-base md:text-lg leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(history) }}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={1}
              className="lg:col-span-7"
            >
              <div className="relative p-px rounded-3xl bg-gradient-to-br from-border/60 via-border/20 to-transparent">
                <div className="bg-card/60 backdrop-blur-sm rounded-[calc(1.5rem-1px)] p-8 md:p-10 border border-border/40">
                  <div className="space-y-10">
                    {pillars.map((p, idx) => (
                      <div key={idx} className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${p.color === "primary" ? "bg-primary ring-4 ring-primary/20" : "bg-accent ring-4 ring-accent/20"}`}
                          />
                          {idx < pillars.length - 1 && <div className="w-0.5 flex-1 min-h-12 bg-border mt-2" />}
                        </div>
                        <div className="pb-2">
                          <h3 className="text-foreground font-heading font-bold text-xl">{p.title}</h3>
                          <p className="text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Values */}
          <section className="space-y-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center space-y-3 max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{valuesTitle}</h2>
              <p className="text-muted-foreground">{valuesSubtitle}</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = valueIcons[i];
                const isAccent = i % 2 === 1;
                return (
                  <motion.div
                    key={v.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    custom={i}
                    className="p-8 rounded-3xl bg-card/40 border border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all group backdrop-blur-sm"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                        isAccent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg md:text-xl font-heading font-bold text-foreground mb-3">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="relative rounded-[40px] overflow-hidden bg-primary p-10 md:p-20 text-center"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 bg-accent/30 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-heading font-black text-primary-foreground leading-tight">
                {ctaTitle}
              </h2>
              {ctaSubtitle && <p className="text-primary-foreground/85 text-base md:text-lg">{ctaSubtitle}</p>}
              <div className="pt-2">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-background text-primary rounded-2xl font-heading font-extrabold shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
                >
                  {ctaButton}
                  <ArrowRight className="w-5 h-5" />
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

import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { toast } from "sonner";
import { contactsApi } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import { useT } from "@/i18n/LanguageContext";
import { z } from "zod";

const ContactoPage = () => {
  const t = useT();

  const contactSchema = useMemo(() => z.object({
    nombre: z.string().trim().min(1, t("contact.validation.name_required")).max(100, t("contact.validation.name_max")),
    email: z.string().trim().min(1, t("contact.validation.email_required")).email(t("contact.validation.email_invalid")).max(255, t("contact.validation.email_max")),
    empresa: z.string().max(100, t("contact.validation.company_max")).optional().default(""),
    telefono: z.string().max(20, t("contact.validation.phone_max")).optional().default(""),
    mensaje: z.string().trim().min(1, t("contact.validation.message_required")).max(1000, t("contact.validation.message_max")),
  }), [t]);

  const contactJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `${t('contact.label')} | ${SITE_NAME}`,
    url: `${SITE_URL}/contacto`,
    description: t('contact.subtitle'),
  }), [t]);

  usePageMeta({
    title: t('contact.label'),
    description: t('contact.subtitle'),
    canonical: '/contacto',
    jsonLd: contactJsonLd,
  });

  const title = useCMSValue('contact_title', '') || t('contact.title');
  const subtitle = useCMSValue('contact_subtitle', '') || t('contact.subtitle');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');

  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!acceptedLegal) {
      setErrors((prev) => ({ ...prev, legal: t('contact.legal_required') }));
      toast.error(t('contact.legal_required'));
      return;
    }

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setErrors((prev) => ({ ...prev, recaptcha: t('contact.captcha_required') }));
      toast.error(t('contact.captcha_required'));
      return;
    }

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t('contact.check_fields'));
      return;
    }

    setLoading(true);
    try {
      await contactsApi.send({ ...result.data, recaptchaToken } as { nombre: string; email: string; empresa?: string; telefono?: string; mensaje: string; recaptchaToken: string });
      toast.success(t('contact.success'));
      setForm({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
      setAcceptedLegal(false);
      recaptchaRef.current?.reset();
    } catch {
      toast.error(t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: t('breadcrumb.home'), path: '/' }, { name: t('contact.label'), path: '/contacto' }]} />
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{t('contact.label')}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-title-gradient mt-3 mb-6">{title}</h1>
          <p className="text-hero-foreground/70 text-lg">{subtitle}</p>
        </motion.div>
      </ParallaxHero>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-nombre" className="block text-sm font-medium text-foreground mb-2">{t('contact.name')} *</label>
                    <input id="contact-nombre" type="text" value={form.nombre}
                      onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrors((prev) => ({ ...prev, nombre: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors.nombre ? 'border-destructive' : 'border-border'}`}
                      placeholder={t('contact.name_placeholder')} maxLength={100} />
                    {errors.nombre && <p className="text-destructive text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">{t('contact.email')} *</label>
                    <input id="contact-email" type="email" value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((prev) => ({ ...prev, email: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors.email ? 'border-destructive' : 'border-border'}`}
                      placeholder={t('contact.email_placeholder')} maxLength={255} />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-empresa" className="block text-sm font-medium text-foreground mb-2">{t('contact.company')}</label>
                    <input id="contact-empresa" type="text" value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder={t('contact.company_placeholder')} maxLength={100} />
                  </div>
                  <div>
                    <label htmlFor="contact-telefono" className="block text-sm font-medium text-foreground mb-2">{t('contact.phone')}</label>
                    <input id="contact-telefono" type="tel" value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder={t('contact.phone_placeholder')} maxLength={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-mensaje" className="block text-sm font-medium text-foreground mb-2">{t('contact.message')} *</label>
                  <textarea id="contact-mensaje" value={form.mensaje}
                    onChange={(e) => { setForm({ ...form, mensaje: e.target.value }); setErrors((prev) => ({ ...prev, mensaje: '' })); }}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none ${errors.mensaje ? 'border-destructive' : 'border-border'}`}
                    placeholder={t('contact.message_placeholder')} maxLength={1000} />
                  {errors.mensaje && <p className="text-destructive text-xs mt-1">{errors.mensaje}</p>}
                </div>
                <div className="flex items-start gap-3">
                  <input id="contact-legal" type="checkbox" checked={acceptedLegal}
                    onChange={(e) => { setAcceptedLegal(e.target.checked); setErrors((prev) => ({ ...prev, legal: '' })); }}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/30 accent-primary" />
                  <label htmlFor="contact-legal" className="text-sm text-muted-foreground leading-snug">
                    {t('contact.legal_accept')}{' '}
                    <Link to="/legal" target="_blank" className="text-primary hover:underline">{t('contact.legal_notice')}</Link>
                    {' '}{t('contact.and_the')}{' '}
                    <Link to="/privacidad" target="_blank" className="text-primary hover:underline">{t('contact.privacy_policy')}</Link>.
                  </label>
                </div>
                {errors.legal && <p className="text-destructive text-xs -mt-4">{errors.legal}</p>}
                <div>
                  <ReCAPTCHA ref={recaptchaRef} sitekey="6LecdKEsAAAAAGT9GO1lCqknRar29G3VLq55rZxJ"
                    onChange={() => setErrors((prev) => ({ ...prev, recaptcha: '' }))} />
                  {errors.recaptcha && <p className="text-destructive text-xs mt-1">{errors.recaptcha}</p>}
                </div>
                <Button variant="hero" size="lg" type="submit" disabled={loading || !acceptedLegal}>
                  {loading ? t('contact.sending') : t('contact.submit')} <Send size={18} />
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="p-8 rounded-2xl bg-card border border-border space-y-8">
                <h3 className="font-heading font-semibold text-lg text-card-foreground">{t('contact.info_title')}</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Mail size={18} className="text-primary" /></div>
                    <div><p className="text-sm font-medium text-foreground">{t('contact.email')}</p><p className="text-sm text-muted-foreground">{contactEmail}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Phone size={18} className="text-primary" /></div>
                    <div><p className="text-sm font-medium text-foreground">{t('contact.phone')}</p><p className="text-sm text-muted-foreground">{contactPhone}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><MapPin size={18} className="text-primary" /></div>
                    <div><p className="text-sm font-medium text-foreground">{t('contact.location')}</p><p className="text-sm text-muted-foreground">{contactAddress}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactoPage;

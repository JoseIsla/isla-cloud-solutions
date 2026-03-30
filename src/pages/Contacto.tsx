import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().min(1, "El email es obligatorio").email("Introduce un email válido").max(255, "Máximo 255 caracteres"),
  empresa: z.string().max(100, "Máximo 100 caracteres").optional().default(""),
  telefono: z.string().max(20, "Máximo 20 caracteres").optional().default(""),
  mensaje: z.string().trim().min(1, "El mensaje es obligatorio").max(1000, "Máximo 1000 caracteres"),
});

const ContactoPage = () => {
  const contactJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contacto | ${SITE_NAME}`,
    url: `${SITE_URL}/contacto`,
    description: 'Contacta con Isla Cloud Solutions. Cuéntanos tu proyecto y te asesoramos sin compromiso.',
  }), []);

  usePageMeta({
    title: 'Contacto',
    description: 'Contacta con Isla Cloud Solutions. Cuéntanos tu proyecto y te asesoramos sin compromiso.',
    canonical: '/contacto',
    jsonLd: contactJsonLd,
  });

  const title = useCMSValue('contact_title', 'Hablemos de tu proyecto');
  const subtitle = useCMSValue('contact_subtitle', 'Cuéntanos qué necesitas y te asesoraremos sin compromiso.');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');

  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!acceptedLegal) {
      setErrors((prev) => ({ ...prev, legal: 'Debes aceptar el aviso legal y la política de privacidad.' }));
      toast.error("Debes aceptar el aviso legal y la política de privacidad.");
      return;
    }

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados en rojo.");
      return;
    }

    setLoading(true);
    try {
      await contactsApi.send(result.data as { nombre: string; email: string; empresa?: string; telefono?: string; mensaje: string });
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.");
      setForm({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
      setAcceptedLegal(false);
    } catch {
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', path: '/' }, { name: 'Contacto', path: '/contacto' }]} />
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Contacto</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
            {title}
          </h1>
          <p className="text-hero-foreground/70 text-lg">
            {subtitle}
          </p>
        </motion.div>
      </ParallaxHero>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-nombre" className="block text-sm font-medium text-foreground mb-2">Nombre *</label>
                    <input
                      id="contact-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrors((prev) => ({ ...prev, nombre: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors.nombre ? 'border-destructive' : 'border-border'}`}
                      placeholder="Tu nombre"
                      maxLength={100}
                    />
                    {errors.nombre && <p className="text-destructive text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((prev) => ({ ...prev, email: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors.email ? 'border-destructive' : 'border-border'}`}
                      placeholder="tu@empresa.com"
                      maxLength={255}
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-empresa" className="block text-sm font-medium text-foreground mb-2">Empresa</label>
                    <input
                      id="contact-empresa"
                      type="text"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Nombre de tu empresa"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-telefono" className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                    <input
                      id="contact-telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="+34 600 000 000"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-mensaje" className="block text-sm font-medium text-foreground mb-2">Mensaje *</label>
                  <textarea
                    id="contact-mensaje"
                    value={form.mensaje}
                    onChange={(e) => { setForm({ ...form, mensaje: e.target.value }); setErrors((prev) => ({ ...prev, mensaje: '' })); }}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none ${errors.mensaje ? 'border-destructive' : 'border-border'}`}
                    placeholder="Cuéntanos sobre tu proyecto..."
                    maxLength={1000}
                  />
                  {errors.mensaje && <p className="text-destructive text-xs mt-1">{errors.mensaje}</p>}
                </div>
                <Button variant="hero" size="lg" type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar mensaje"} <Send size={18} />
                </Button>
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-8 rounded-2xl bg-card border border-border space-y-8">
                <h3 className="font-heading font-semibold text-lg text-card-foreground">Información de contacto</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Ubicación</p>
                      <p className="text-sm text-muted-foreground">{contactAddress}</p>
                    </div>
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

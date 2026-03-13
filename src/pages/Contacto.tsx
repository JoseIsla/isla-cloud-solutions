import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { contactsApi } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";

const ContactoPage = () => {
  const title = useCMSValue('contact_title', 'Hablemos de tu proyecto');
  const subtitle = useCMSValue('contact_subtitle', 'Cuéntanos qué necesitas y te asesoraremos sin compromiso.');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');

  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await contactsApi.send(form);
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.");
      setForm({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
    } catch {
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.");
      setForm({ nombre: "", email: "", empresa: "", telefono: "", mensaje: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Contacto</span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
              {title}
            </h1>
            <p className="text-hero-foreground/70 text-lg">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </section>

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
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Tu nombre"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="tu@empresa.com"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Empresa</label>
                    <input
                      type="text"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Nombre de tu empresa"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                    <input
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
                  <label className="block text-sm font-medium text-foreground mb-2">Mensaje *</label>
                  <textarea
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu proyecto..."
                    maxLength={1000}
                  />
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

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { services } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";

const ServicioDetalle = () => {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);

  if (!service) {
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

  const Icon = service.icon;
  const heroImage = serviceImages[service.slug];

  return (
    <Layout>
      {/* Hero */}
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
              {service.title}
            </h1>
            <p className="text-hero-foreground/70 text-lg leading-relaxed">{service.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              {heroImage && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <img
                    src={heroImage}
                    alt={service.title}
                    className="w-full rounded-2xl object-cover aspect-video shadow-lg"
                    loading="lazy"
                  />
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Descripción del servicio</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{service.longDescription}</p>
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
                  {service.features.map((feature) => (
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

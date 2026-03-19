import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { services as fallbackServices } from "@/data/services";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import {
  Server, Shield, Cloud, Monitor, Globe, Smartphone,
  Lock, Wrench, Database, type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone,
  Lock, Wrench, Database,
};

const ServicesSection = () => {
  const sectionLabel = useCMSValue('services_section_label', 'Nuestros Servicios');
  const sectionTitle = useCMSValue('services_section_title', 'Soluciones IT completas para tu empresa');
  const sectionSubtitle = useCMSValue('services_section_subtitle', 'Desde la gestión diaria de tu IT hasta la estrategia tecnológica a largo plazo, Isla Cloud cubre todo el espectro de necesidades IT de tu empresa.');
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list()
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, []);

  const useApi = apiServices && apiServices.length > 0;

  const renderCard = (
    slug: string,
    title: string,
    description: string,
    Icon: LucideIcon,
    index: number
  ) => (
    <motion.div
      key={slug}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
    >
      <Link
        to={`/servicios/${slug}`}
        className="group flex flex-col h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
      >
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon size={28} className="text-primary group-hover:text-primary-foreground transition-colors" />
        </div>
        <h3 className="font-heading font-bold text-lg text-card-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
          {description}
        </p>
        <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
          Más información <ArrowRight size={16} />
        </span>
      </Link>
    </motion.div>
  );

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-16"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            {sectionLabel}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-4 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg mt-5 leading-relaxed">
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useApi
            ? apiServices!.map((service, index) => {
                const Icon = iconMap[service.icon] || Server;
                return renderCard(service.slug, service.short_title, service.description, Icon, index);
              })
            : fallbackServices.map((service, index) => {
                return renderCard(service.slug, service.shortTitle, service.description, service.icon, index);
              })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

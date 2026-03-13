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
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list()
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, []);

  // Use API services if available, otherwise fallback to hardcoded
  const useApi = apiServices && apiServices.length > 0;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            {sectionLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
            {sectionTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useApi
            ? apiServices!.map((service, index) => {
                const Icon = iconMap[service.icon] || Server;
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      to={`/servicios/${service.slug}`}
                      className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-card-foreground mb-3">
                        {service.short_title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Más información <ArrowRight size={14} />
                      </span>
                    </Link>
                  </motion.div>
                );
              })
            : fallbackServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      to={`/servicios/${service.slug}`}
                      className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-card-foreground mb-3">
                        {service.shortTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Más información <ArrowRight size={14} />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

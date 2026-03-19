import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { services as fallbackServices } from "@/data/services";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import servicesBg from "@/assets/services-bg.jpg";
import {
  Server, Shield, Cloud, Monitor, Globe, Smartphone,
  Lock, Wrench, Database, type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone,
  Lock, Wrench, Database,
};

const ServicesSection = () => {
  const sectionTitle = useCMSValue(
    'services_section_title',
    'Resolvemos los Problemas Tecnológicos que Frenan tu Empresa'
  );
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list()
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, []);

  const useApi = apiServices && apiServices.length > 0;

  const serviceItems = useApi
    ? apiServices!.map((s) => ({
        slug: s.slug,
        title: s.short_title,
        Icon: iconMap[s.icon] || Server,
      }))
    : fallbackServices.map((s) => ({
        slug: s.slug,
        title: s.shortTitle,
        Icon: s.icon,
      }));

  return (
    <section
      id="servicios"
      className="relative min-h-screen flex items-center -mt-32 md:-mt-44 z-10"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={servicesBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — Big heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1]">
              {sectionTitle}
            </h2>
          </motion.div>

          {/* Right — Service links list */}
          <div className="flex flex-col">
            {serviceItems.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
              >
                <Link
                  to={`/servicios/${service.slug}`}
                  className="group flex items-center justify-between py-5 md:py-6 border-b border-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <service.Icon
                      size={22}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="text-white text-lg md:text-xl font-medium group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </span>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-white/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

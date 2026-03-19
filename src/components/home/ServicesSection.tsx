import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
      className="relative -mt-24 md:-mt-32 z-10"
    >
      {/* Top fade — creates the "eating" effect over the gradient text */}
      <div className="h-24 md:h-32 bg-gradient-to-b from-background to-transparent relative z-20 pointer-events-none" />

      {/* Main content area with background image */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <img
            src={servicesBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left — Big heading (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 lg:sticky lg:top-32"
            >
              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-bold text-white/60 leading-[1.1]">
                {sectionTitle}
              </h2>
            </motion.div>

            {/* Right — Service cards grid (7 cols) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {serviceItems.map((service, index) => (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link
                      to={`/servicios/${service.slug}`}
                      className="group flex flex-col gap-3 p-5 md:p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <service.Icon
                        size={24}
                        className="text-white/70 group-hover:text-primary transition-colors duration-300"
                      />
                      <span className="text-white text-sm md:text-base font-semibold leading-snug">
                        {service.title}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

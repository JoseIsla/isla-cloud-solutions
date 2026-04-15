import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { services as fallbackServices } from "@/data/services";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import servicesBg from "@/assets/services-bg.webp";
import {
  Server,
  Shield,
  Cloud,
  Monitor,
  Globe,
  Smartphone,
  Lock,
  Wrench,
  Database,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database,
};

const ServicesSection = () => {
  const sectionTitle = useCMSValue(
    "services_section_title",
    "Resolvemos los Problemas Tecnológicos que Frenan tu Empresa"
  );
  const servicesCta = useCMSValue("services_card_cta", "Ver más");
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    servicesApi.list(language).then(setApiServices).catch(() => setApiServices(null));
  }, [language]);

  const useApi = apiServices && apiServices.length > 0;

  const serviceItems = useApi
    ? apiServices!.map((service) => ({
        slug: service.slug,
        title: service.short_title,
        description: service.description,
        Icon: iconMap[service.icon] || Server,
      }))
    : fallbackServices.map((service) => ({
        slug: service.slug,
        title: service.shortTitle,
        description: service.description,
        Icon: service.icon,
      }));

  return (
    <section id="servicios" className="relative z-20">
      {/* Soft shadow that fades the sticky intro behind */}
      <div
        aria-hidden="true"
        className="services-overlap-cap pointer-events-none absolute inset-x-0 z-0 h-12 md:h-16 lg:h-20"
        style={{ bottom: "100%" }}
      />

      <div className="relative z-10 min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <BlurImage
            src={servicesBg}
            alt=""
            className="h-full w-full object-cover"
            wrapperClassName="h-full w-full"
            placeholderColor="#0a1628"
          />
          <div className="services-image-overlay absolute inset-0" />
          <div className="services-image-vignette absolute inset-0" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-36 lg:pb-32">
          {/* Header - top left aligned */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 md:mb-16 lg:mb-20 max-w-2xl"
          >
            <h2 className="services-heading font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {sectionTitle}
            </h2>
          </motion.div>

          {/* Services grid - 3 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {serviceItems.map((service, idx) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  delay: idx * 0.07,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  to={`/servicios/${service.slug}`}
                  className="services-card group flex flex-col justify-between h-full min-h-[180px] rounded-2xl p-6 md:p-7"
                >
                  <div>
                    <service.Icon size={22} className="services-card-icon mb-5" />
                    <h3 className="services-card-title text-lg font-semibold leading-tight md:text-xl mb-2">
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-[hsl(var(--services-foreground-soft))] text-sm leading-relaxed line-clamp-2 opacity-70">
                        {service.description}
                      </p>
                    )}
                  </div>
                    <span className="flex items-center gap-1.5 text-primary/80 text-sm font-medium mt-5
                      group-hover:text-primary group-hover:gap-2.5 transition-all duration-300">
                      {servicesCta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
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

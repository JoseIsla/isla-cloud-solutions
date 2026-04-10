import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  Server,
  Shield,
  Cloud,
  Monitor,
  Globe,
  Smartphone,
  Lock,
  Wrench,
  Database,
};

const ServicesSection = () => {
  const sectionTitle = useCMSValue(
    "services_section_title",
    "Resolvemos los Problemas Tecnológicos que Frenan tu Empresa"
  );
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
        Icon: iconMap[service.icon] || Server,
      }))
    : fallbackServices.map((service) => ({
        slug: service.slug,
        title: service.shortTitle,
        Icon: service.icon,
      }));

  return (
    <section
      id="servicios"
      className="relative z-20"
    >
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

        <div className="container relative z-10 mx-auto px-4 pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-40 lg:pb-36">
          <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-4 lg:sticky lg:top-32"
            >
              <h2 className="services-heading max-w-md font-heading text-4xl font-bold leading-[0.96] md:text-5xl lg:text-[4.25rem]">
                {sectionTitle}
              </h2>
            </motion.div>

            <div className="lg:col-span-7 lg:pt-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {serviceItems.map((service, idx) => (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      delay: idx * 0.08,
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={`/servicios/${service.slug}`}
                      className="services-card group flex min-h-[140px] flex-col justify-between gap-8 rounded-[1.75rem] p-5 md:p-6"
                    >
                      <service.Icon size={24} className="services-card-icon" />
                      <span className="services-card-title text-lg font-semibold leading-tight md:text-xl">
                        {service.title}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

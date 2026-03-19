import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { services as fallbackServices } from "@/data/services";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import servicesBg from "@/assets/services-bg.jpg";
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

type OverlapState = {
  capOpacity: number;
  lift: number;
};

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sectionTitle = useCMSValue(
    "services_section_title",
    "Resolvemos los Problemas Tecnológicos que Frenan tu Empresa"
  );
  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);
  const [overlap, setOverlap] = useState<OverlapState>({ capOpacity: 0, lift: 0 });

  useEffect(() => {
    servicesApi.list().then(setApiServices).catch(() => setApiServices(null));
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateOverlap = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.05;
      const raw = (start - rect.top) / (start - end);
      // Linear progress for tight scroll sync
      const progress = Math.max(0, Math.min(1, raw));
      const maxLift =
        window.innerWidth >= 1280 ? 420 :
        window.innerWidth >= 1024 ? 360 :
        window.innerWidth >= 768 ? 280 :
        200;

      setOverlap({
        capOpacity: Math.min(1, progress * 1.2),
        lift: progress * maxLift,
      });
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        updateOverlap();
        frameId = 0;
      });
    };

    updateOverlap();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      ref={sectionRef}
      className="relative z-20"
      style={{ marginTop: `-${overlap.lift}px` }}
    >
      {/* Fade sits above the image edge so it only softens the intro text behind it */}
      <div
        aria-hidden="true"
        className="services-overlap-cap pointer-events-none absolute inset-x-0 z-0 h-20 md:h-28 lg:h-36"
        style={{
          opacity: overlap.capOpacity,
          bottom: "100%",
        }}
      />

      <div className="relative z-10 min-h-screen overflow-hidden">
        <div className="absolute inset-0">
            <img
              src={servicesBg}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="services-image-overlay absolute inset-0" />
            <div className="services-image-vignette absolute inset-0" />
          </div>

          <div className="container relative z-10 mx-auto px-4 pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-40 lg:pb-36">
            <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 lg:sticky lg:top-32"
              >
                <h2 className="services-heading max-w-md font-heading text-4xl font-bold leading-[0.96] md:text-5xl lg:text-[4.25rem]">
                  {sectionTitle}
                </h2>
              </motion.div>

              <div className="lg:col-span-7 lg:pt-12">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                  {serviceItems.map((service, index) => (
                    <motion.div
                      key={service.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                      <Link
                        to={`/servicios/${service.slug}`}
                        className="services-card group flex min-h-[152px] flex-col justify-between gap-10 rounded-[1.75rem] p-5 md:p-6"
                      >
                        <service.Icon size={26} className="services-card-icon" />
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
      </div>
    </section>
  );
};

export default ServicesSection;

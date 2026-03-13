import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCMSValue } from "@/hooks/useCMS";

const AnimatedCounter = ({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("es-ES")}{suffix}
    </span>
  );
};

const CountersSection = () => {
  const counters = [
    { target: parseInt(useCMSValue('counter_projects', '298')) || 298, suffix: "+", label: useCMSValue('counter_projects_label', 'Proyectos') },
    { target: parseInt(useCMSValue('counter_maintenance', '315')) || 315, suffix: "+", label: useCMSValue('counter_maintenance_label', 'Mantenimientos') },
    { target: parseInt(useCMSValue('counter_clients', '169')) || 169, suffix: "+", label: useCMSValue('counter_clients_label', 'Clientes') },
    { target: parseInt(useCMSValue('counter_systems', '167')) || 167, suffix: "+", label: useCMSValue('counter_systems_label', 'Sistemas administrados') },
  ];

  return (
    <section className="py-16 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                <AnimatedCounter target={c.target} suffix={c.suffix} />
              </div>
              <div className="text-hero-foreground/60 text-sm uppercase tracking-wider font-medium">
                {c.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountersSection;

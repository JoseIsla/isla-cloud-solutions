import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCMSValue } from "@/hooks/useCMS";

const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
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
      {count.toLocaleString("es-ES")}
    </span>
  );
};

const CountersSection = () => {
  const counters = [
    {
      target: parseInt(useCMSValue('counter_projects', '298')) || 298,
      suffix: "+",
      label: useCMSValue('counter_projects_label', 'Proyectos completados'),
      color: 'primary' as const,
    },
    {
      target: parseInt(useCMSValue('counter_maintenance', '315')) || 315,
      suffix: "+",
      label: useCMSValue('counter_maintenance_label', 'Mantenimientos activos'),
      color: 'accent' as const,
      offset: true,
    },
    {
      target: parseInt(useCMSValue('counter_clients', '169')) || 169,
      suffix: "+",
      label: useCMSValue('counter_clients_label', 'Clientes satisfechos'),
      color: 'primary' as const,
    },
    {
      target: parseInt(useCMSValue('counter_systems', '167')) || 167,
      suffix: "+",
      label: useCMSValue('counter_systems_label', 'Sistemas administrados'),
      color: 'accent' as const,
      offset: true,
    },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-background">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-16 text-center"
        >
          <div
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'hsl(var(--primary) / 0.06)',
              border: '1px solid hsl(var(--primary) / 0.12)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'hsl(var(--primary))' }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-medium"
              style={{ color: 'hsl(var(--primary))' }}
            >
              Métricas en vivo
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground tracking-tight">
            Nuestra trayectoria en cifras
          </h2>
          <p className="mt-4 font-light tracking-wide max-w-2xl text-lg text-muted-foreground">
            Más de dos décadas de experiencia respaldan cada número.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative flex flex-col p-8 rounded-3xl overflow-hidden transition-all duration-500 ${c.offset ? 'lg:translate-y-4' : ''}`}
              style={{
                background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted) / 0.5))',
                border: '1px solid hsl(var(--border) / 0.6)',
                boxShadow: '0 8px 40px -12px hsl(var(--foreground) / 0.08)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = c.color === 'primary'
                  ? '0 16px 60px -12px hsl(var(--primary) / 0.12)'
                  : '0 16px 60px -12px hsl(var(--accent) / 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 40px -12px hsl(var(--foreground) / 0.08)';
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: c.color === 'primary'
                    ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)'
                    : 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.4), transparent)',
                }}
              />

              {/* Index */}
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Number */}
              <div className="mt-8 text-5xl md:text-6xl font-light tracking-tighter text-foreground">
                <AnimatedCounter target={c.target} />
                <span
                  className="font-medium"
                  style={{ color: c.color === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                >
                  {c.suffix}
                </span>
              </div>

              {/* Label */}
              <div className="mt-2 text-sm font-light tracking-wide text-muted-foreground">
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

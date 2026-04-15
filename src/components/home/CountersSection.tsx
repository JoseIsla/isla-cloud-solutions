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

const AnimatedBar = ({ percent, color }: { percent: number; color: 'primary' | 'accent' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'hsla(0, 0%, 100%, 0.05)' }}>
      <div
        className="h-full rounded-full transition-all duration-[1.5s] ease-out"
        style={{
          width: isInView ? `${percent}%` : '0%',
          background: color === 'primary'
            ? 'linear-gradient(to right, hsl(var(--primary) / 0.2), hsl(var(--primary)))'
            : 'linear-gradient(to right, hsl(var(--accent) / 0.2), hsl(var(--accent)))',
          boxShadow: color === 'primary'
            ? '0 0 10px hsl(var(--primary) / 0.5)'
            : '0 0 10px hsl(var(--accent) / 0.5)',
        }}
      />
    </div>
  );
};

const CountersSection = () => {
  const counters = [
    {
      target: parseInt(useCMSValue('counter_projects', '298')) || 298,
      suffix: "+",
      label: useCMSValue('counter_projects_label', 'Proyectos completados'),
      barLabel: 'Capacidad',
      barValue: '88%',
      barPercent: 88,
      color: 'primary' as const,
    },
    {
      target: parseInt(useCMSValue('counter_maintenance', '315')) || 315,
      suffix: "+",
      label: useCMSValue('counter_maintenance_label', 'Mantenimientos activos'),
      barLabel: 'Integridad',
      barValue: '94%',
      barPercent: 94,
      color: 'accent' as const,
      offset: true,
    },
    {
      target: parseInt(useCMSValue('counter_clients', '169')) || 169,
      suffix: "+",
      label: useCMSValue('counter_clients_label', 'Clientes satisfechos'),
      barLabel: 'Uptime',
      barValue: '99.9%',
      barPercent: 100,
      color: 'primary' as const,
    },
    {
      target: parseInt(useCMSValue('counter_systems', '167')) || 167,
      suffix: "+",
      label: useCMSValue('counter_systems_label', 'Sistemas administrados'),
      barLabel: 'Sincronización',
      barValue: 'Óptima',
      barPercent: 91,
      color: 'accent' as const,
      offset: true,
    },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-hero">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, hsla(0, 0%, 100%, 0.02) 1px, transparent 1px), linear-gradient(to bottom, hsla(0, 0%, 100%, 0.02) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* Ambient glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.08), transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, hsl(var(--accent) / 0.05), transparent 60%)', filter: 'blur(60px)' }}
      />

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
              background: 'hsl(var(--accent) / 0.05)',
              border: '1px solid hsl(var(--accent) / 0.2)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'hsl(var(--accent))', boxShadow: '0 0 8px hsl(var(--accent) / 0.8)' }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-medium"
              style={{ color: 'hsl(var(--accent))' }}
            >
              Cifras en vivo
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-hero-foreground tracking-tight">
            Nuestra trayectoria en cifras
          </h2>
          <p className="mt-4 font-light tracking-wide max-w-2xl text-lg" style={{ color: 'hsla(0, 0%, 100%, 0.4)' }}>
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
              className={`group relative flex flex-col p-8 rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-500 ${c.offset ? 'lg:translate-y-4' : ''}`}
              style={{
                background: 'hsla(220, 50%, 5%, 0.4)',
                border: '1px solid hsla(0, 0%, 100%, 0.05)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none transition-colors duration-700"
                style={{
                  background: c.color === 'primary'
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--accent) / 0.1)',
                  filter: 'blur(60px)',
                }}
              />
              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  border: `1px solid ${c.color === 'primary' ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--accent) / 0.3)'}`,
                }}
              />

              {/* Index */}
              <div className="flex items-center justify-between w-full mb-12 relative z-10">
                <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'hsla(0, 0%, 100%, 0.3)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Number */}
              <div className="relative z-10 mb-2">
                <div className="text-5xl md:text-6xl font-light tracking-tighter text-hero-foreground">
                  <AnimatedCounter target={c.target} suffix="" />
                  <span
                    className="font-medium"
                    style={{ color: c.color === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                  >
                    {c.suffix}
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="text-sm font-light tracking-wide mb-8 relative z-10" style={{ color: 'hsla(0, 0%, 100%, 0.6)' }}>
                {c.label}
              </div>

              {/* Progress bar */}
              <div className="w-full mt-auto relative z-10">
                <div className="flex justify-between text-[10px] mb-2" style={{ color: 'hsla(0, 0%, 100%, 0.3)' }}>
                  <span>{c.barLabel}</span>
                  <span style={{ color: c.color === 'primary' ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--accent) / 0.8)' }}>
                    {c.barValue}
                  </span>
                </div>
                <AnimatedBar percent={c.barPercent} color={c.color} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountersSection;

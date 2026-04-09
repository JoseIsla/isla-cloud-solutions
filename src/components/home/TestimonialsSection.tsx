import { motion } from "framer-motion";
import BlurImage from "@/components/BlurImage";
import { useEffect, useState, useRef } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";
import { testimonialsApi, type TestimonialFromAPI } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

const TestimonialsSection = () => {
  const sectionLabel = useCMSValue('testimonials_section_label', 'Testimonios');
  const sectionTitle = useCMSValue('testimonials_section_title', 'Lo que dicen nuestros clientes');
  const sectionSubtitle = useCMSValue('testimonials_section_subtitle', 'La satisfacción de nuestros clientes es nuestra mejor carta de presentación.');

  const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    testimonialsApi.list(language).then(setTestimonials).catch(() => {});
  }, [language]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [testimonials.length]);

  const goTo = (index: number) => {
    setCurrent(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
  };

  if (testimonials.length === 0) return null;

  const t = testimonials[current];

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "text-amber-400" : "text-muted-foreground/20"}
        fill={i < rating ? "currentColor" : "none"}
      />
    ));

  return (
    <section className="py-14 md:py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            {sectionLabel}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-4 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg mt-4">
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goTo((current + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                aria-label="Testimonio siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Testimonial card */}
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center relative"
          >
            <Quote size={40} className="text-primary/15 mx-auto mb-6" />

            <p className="text-foreground text-lg md:text-xl lg:text-2xl font-heading font-medium leading-relaxed mb-8 italic">
              "{t.quote}"
            </p>

            <div className="flex justify-center gap-0.5 mb-5">
              {renderStars(t.rating)}
            </div>

            <div className="flex items-center justify-center gap-4">
              {t.avatar_url ? (
                <BlurImage
                  src={t.avatar_url}
                  alt={t.author_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  wrapperClassName="w-12 h-12 rounded-full"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {t.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <p className="font-heading font-semibold text-foreground">{t.author_name}</p>
                <p className="text-muted-foreground text-sm">
                  {[t.author_role, t.author_company].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === current ? "bg-primary w-8" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

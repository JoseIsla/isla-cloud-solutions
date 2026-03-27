import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxHeroProps {
  children: ReactNode;
}

const ParallaxHero = ({ children }: ParallaxHeroProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section ref={ref} className="bg-hero grid-pattern py-24 overflow-hidden relative">
      <motion.div style={{ y, opacity }} className="container mx-auto px-4">
        {children}
      </motion.div>
    </section>
  );
};

export default ParallaxHero;

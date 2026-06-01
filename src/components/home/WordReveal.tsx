import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WordRevealProps {
  children: string;
  className?: string;
  /** Delay before starting the animation */
  delay?: number;
  /** Render wrapper – allows using h1, p, span, etc. */
  as?: keyof JSX.IntrinsicElements;
  /** Optional highlighted word that gets wrapped in a span with text-gradient */
  highlight?: string;
  /** If true, applies a continuous white→blue gradient across all words */
  gradient?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.04,
      delayChildren: delay,
    },
  }),
  exit: {
    transition: { staggerChildren: 0.015, staggerDirection: -1 },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.15,
      ease: [0.5, 0, 0.75, 0] as [number, number, number, number],
    },
  },
};

const WordReveal = ({
  children,
  className = "",
  delay = 0,
  as: Tag = "span",
  highlight,
  gradient = false,
}: WordRevealProps) => {
  const words = children.split(" ");
  const total = words.length;

  const renderWord = (word: string, i: number): ReactNode => {
    const isHighlighted = highlight && word.includes(highlight);

    // For continuous gradient: each word gets the full gradient sized to span N words,
    // shifted by its index so the gradient appears unbroken across the whole title.
    const gradientStyle = gradient
      ? ({
          backgroundImage:
            "linear-gradient(90deg, hsl(0 0% 100%) 0%, hsl(0 0% 100%) 35%, hsl(var(--primary)) 70%, hsl(var(--tech-cyan)) 100%)",
          backgroundSize: `${total * 100}% 100%`,
          backgroundPosition: `${(i / Math.max(total - 1, 1)) * 100}% 50%`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        } as React.CSSProperties)
      : undefined;

    return (
      <motion.span
        key={i}
        variants={wordVariants}
        className="inline-block"
        style={{ marginRight: "0.25em", ...(gradientStyle || {}) }}
      >
        {isHighlighted ? (
          <span className="text-gradient">{word}</span>
        ) : (
          word
        )}
      </motion.span>
    );
  };

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: "inline" }}
    >
      {words.map((word, i) => renderWord(word, i))}
    </motion.span>
  );
};

export default WordReveal;

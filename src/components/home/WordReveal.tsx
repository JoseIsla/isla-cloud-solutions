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
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: {
      duration: 0.15,
      ease: [0.5, 0, 0.75, 0],
    },
  },
};

const WordReveal = ({
  children,
  className = "",
  delay = 0,
  as: Tag = "span",
  highlight,
}: WordRevealProps) => {
  const words = children.split(" ");

  const renderWord = (word: string, i: number): ReactNode => {
    const isHighlighted = highlight && word.includes(highlight);

    return (
      <motion.span
        key={i}
        variants={wordVariants}
        className="inline-block"
        style={{ marginRight: "0.25em" }}
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

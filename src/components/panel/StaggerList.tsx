import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

export const StaggerList = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div variants={container} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: any }) => (
  <motion.div variants={item} className={className} {...props}>
    {children}
  </motion.div>
);

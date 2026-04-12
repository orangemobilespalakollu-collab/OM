'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition Wrapper
 * Provides a smooth fade and slide-up transition for page content.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom quint ease
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer
 * Automatically staggers the entrance of its children.
 * Works best with motion.div children using standard variants.
 */
export function StaggerContainer({ children, delay = 0.05 }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveal
 * Animates elements when they enter the viewport.
 */
export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn
 * Simple scale-and-fade entry.
 */
export function ScaleIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.35, 
        delay,
        ease: [0.34, 1.56, 0.64, 1] // Springy ease
      }}
    >
      {children}
    </motion.div>
  );
}

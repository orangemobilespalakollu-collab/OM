'use client';

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * PageTransition Wrapper
 * Provides a smooth fade and slide-up transition for page content.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * MagicalGrid
 * A container that staggers children and adds a background glow aura.
 */
export function MagicalGrid({ children, className }) {
  return (
    <motion.div 
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ParallaxScroll
 * Adds a subtle 3D-like parallax shift based on scroll position.
 */
export function ParallaxScroll({ children, offset = 20 }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div style={{ y: springY }}>
      {children}
    </motion.div>
  );
}

/**
 * FloatingIcon
 * A wrapper that makes an icon float independently.
 */
export function FloatingIcon({ children, duration = 3, delay = 0 }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -8, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration, 
        delay, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * TextReveal
 * Animates text characters or words for a premium entry.
 */
export function TextReveal({ text, className }) {
  const words = text.split(" ");
  return (
    <div className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

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

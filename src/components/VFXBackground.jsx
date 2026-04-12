'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * VFXBackground - A premium, mobile-optimized ambient background.
 * Uses CSS radial-gradients and Motion for autonomous morphing.
 */
export default function VFXBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#fafafa]">
      {/* Dynamic Mesh Gradients */}
      <motion.div
        className="absolute -inset-[50%] opacity-40 blur-[80px]"
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(34, 197, 94, 0.08) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating Glass Orbs - Slow Ambient Motion */}
      <div className="absolute inset-0">
        {[
          { color: 'bg-orange-500/10', size: 'w-64 h-64', top: '10%', left: '5%', delay: 0 },
          { color: 'bg-purple-500/10', size: 'w-48 h-48', top: '60%', left: '75%', delay: 2 },
          { color: 'bg-blue-400/8', size: 'w-72 h-72', top: '30%', left: '40%', delay: 4 },
          { color: 'bg-emerald-400/5', size: 'w-40 h-40', top: '75%', left: '15%', delay: 1 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-[60px] ${orb.size} ${orb.color}`}
            style={{ top: orb.top, left: orb.left }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: orb.delay,
            }}
          />
        ))}
      </div>

      {/* Subtle Grain Overlay for Premium Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

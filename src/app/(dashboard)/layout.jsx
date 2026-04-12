'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import VFXBackground from '@/components/VFXBackground';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500 shadow-xl shadow-orange-500/10"></div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-orange-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            OM
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <VFXBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 1.02 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            mass: 0.5
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

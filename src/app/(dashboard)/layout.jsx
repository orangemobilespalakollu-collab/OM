'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Layout from '@/components/Layout';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  /* Animate the loading dot count */
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [loading]);

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;600;700&display=swap');
          :root {
            --accent: #f97316;
          }
          @keyframes dl-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes dl-spin-rev {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
          @keyframes dl-blob {
            0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            33%      { border-radius: 30% 70% 60% 40% / 50% 60% 30% 60%; }
            66%      { border-radius: 50% 30% 70% 40% / 40% 70% 30% 60%; }
          }
          @keyframes dl-orbit {
            from { transform: rotate(0deg) translateX(36px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
          }
          @keyframes dl-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes dl-pulse-ring {
            0%   { transform: scale(0.85); opacity: 0.6; }
            70%  { transform: scale(1.8);  opacity: 0; }
            100% { transform: scale(1.8);  opacity: 0; }
          }
          @keyframes dl-bar {
            0%   { width: 0%; }
            30%  { width: 45%; }
            65%  { width: 72%; }
            85%  { width: 88%; }
            100% { width: 95%; }
          }
          .dl-font-display { font-family: 'Instrument Serif', Georgia, serif; }
          .dl-font-body    { font-family: 'Geist', system-ui, sans-serif; }
        `}</style>

        <div
          className="dl-font-body"
          style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background morph blobs */}
          <div style={{ position: 'absolute', width: 280, height: 280, background: 'var(--accent)', opacity: 0.05, top: -60, right: -60, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', animation: 'dl-blob 10s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, background: 'var(--accent)', opacity: 0.04, bottom: -40, left: '15%', borderRadius: '30% 70% 60% 40% / 50% 60% 30% 60%', animation: 'dl-blob 13s ease-in-out 3s infinite', pointerEvents: 'none' }} />

          {/* Decorative rings */}
          <div style={{ position: 'absolute', top: 28, right: 28, width: 80, height: 80, borderRadius: '50%', border: '1px dashed rgba(249,115,22,0.15)', animation: 'dl-spin 20s linear infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 37, right: 37, width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(249,115,22,0.08)', animation: 'dl-spin-rev 11s linear infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 28, width: 60, height: 60, borderRadius: '50%', border: '1px dashed rgba(249,115,22,0.12)', animation: 'dl-spin 15s linear infinite', pointerEvents: 'none' }} />

          {/* Orbiting dot */}
          <div style={{ position: 'absolute', top: 44, right: 44, pointerEvents: 'none' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.45, animation: 'dl-orbit 9s linear infinite' }} />
          </div>

          {/* Main loading card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.75rem',
              animation: 'dl-fade-in 0.6s ease both',
              padding: '2rem',
            }}
          >
            {/* Logo icon with pulse ring */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '1.25rem',
                background: '#0d0d0d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                position: 'relative', zIndex: 1,
              }}>
                {/* Spinner ring inside icon */}
                <div style={{
                  position: 'absolute', inset: 8,
                  borderRadius: '50%',
                  border: '2.5px solid transparent',
                  borderTopColor: 'var(--accent)',
                  borderRightColor: 'rgba(249,115,22,0.3)',
                  animation: 'dl-spin 0.9s linear infinite',
                }} />
                {/* Inner accent dot */}
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px rgba(249,115,22,0.6)' }} />
              </div>
              {/* Pulse ring */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '1.25rem', background: 'rgba(249,115,22,0.2)', animation: 'dl-pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite', zIndex: 0 }} />
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <h1 className="dl-font-display" style={{ fontSize: '1.625rem', fontWeight: 400, lineHeight: 1.1, color: '#0d0d0d', fontStyle: 'italic', margin: 0 }}>
                Orange <span style={{ color: 'var(--accent)' }}>Mobile</span>
              </h1>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#9ca3af', margin: 0 }}>
                Loading your workspace{'.'.repeat(dots + 1)}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ width: 200, height: 3, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent), #c2410c)',
                borderRadius: 999,
                animation: 'dl-bar 2.4s cubic-bezier(0.4,0,0.2,1) both',
                boxShadow: '0 0 8px rgba(249,115,22,0.4)',
              }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;
  return <Layout>{children}</Layout>;
}

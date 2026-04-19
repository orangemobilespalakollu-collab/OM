import { Inter, JetBrains_Mono } from 'next/font/google';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import { cn } from "@/lib/utils";
import { cn } from '@/lib/utils';

const inter = Inter({
const geist = Geist({
subsets: ['latin'],
variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
const geistMono = Geist_Mono({
subsets: ['latin'],
variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Orange Mobile - Service & Sales Management',
  title: 'Orange Mobile — Service & Sales Management',
description: 'Production-grade management system for Orange Mobile',
  themeColor: '#f97316',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  console.log('Rendering RootLayout');
return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable)}>
    <html lang="en" className={cn(geist.variable, geistMono.variable)}>
<body className="font-sans antialiased bg-background text-foreground">
<AuthProvider>
          <Toaster position="top-center" richColors />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans), system-ui, sans-serif',
                borderRadius: '0.875rem',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          />
{children}
</AuthProvider>
</body>

import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Orange Mobile - Service & Sales Management',
  description: 'Production-grade management system for Orange Mobile',
};

export default function RootLayout({ children }) {
  console.log('Rendering RootLayout');
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <Toaster position="top-center" richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

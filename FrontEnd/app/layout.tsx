import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const cairo = Cairo({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Medimate - Your Healthcare Companion',
  description: 'AI-powered healthcare platform for personalized medical assistance',
  icons: {
    icon: [
      { url: '/white.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/black.svg', media: '(prefers-color-scheme: light)' },
    ],
    shortcut: [
      { url: '/white.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/black.svg', media: '(prefers-color-scheme: light)' },
    ],
    apple: [
      { url: '/white.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/black.svg', media: '(prefers-color-scheme: light)' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cairo.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
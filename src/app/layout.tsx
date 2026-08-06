import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Mnar Photofilm | Photo Sessions Schedule',
  description: 'Book your session with Mnar Photofilm — professional photography with artistic elegance.',
  keywords: ['photography', 'photo sessions', 'photographer', 'Mnar Photofilm', 'weddings', 'events'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} h-full`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

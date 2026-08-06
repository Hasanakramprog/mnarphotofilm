import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Mnar Photofilm | جلسات التصوير',
  description: 'احجز جلستك مع Mnar Photofilm — جلسات تصوير احترافية بلمسة فنية راقية.',
  keywords: ['تصوير', 'جلسات تصوير', 'photographer', 'Mnar Photofilm', 'حفلات زفاف'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}

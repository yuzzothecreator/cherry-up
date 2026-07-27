import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Cherry-Up — AI Instagram Growth Assistant',
  description: 'Ethical AI-powered Instagram growth through analytics, content intelligence, and safe automation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}

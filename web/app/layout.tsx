import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aging Network Model',
  description: 'Interactive exploration of systemic aging dynamics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js" async></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aging Network Model | Interactive Systemic Rejuvenation Simulator',
  description: 'Explore coupled dynamical systems of aging across cardiovascular, musculoskeletal, and neurological subsystems. Simulate interventions like exercise, drugs, parabiosis, and organ replacement.',
  keywords: ['aging', 'longevity', 'rejuvenation', 'systems biology', 'computational model', 'healthspan', 'lifespan'],
  authors: [{ name: 'Sacha Martinelle' }],
  openGraph: {
    title: 'Aging Network Model',
    description: 'Interactive exploration of systemic aging dynamics and rejuvenation interventions',
    url: 'https://systemic-rejuvenation.vercel.app',
    siteName: 'Aging Network Model',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aging Network Model',
    description: 'Interactive exploration of systemic aging dynamics',
  },
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

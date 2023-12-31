import SupabaseProvider from './supabase-provider';
import Footer from '@/components/ui/Footer';
import { Hero } from '@/components/ui/Hero/Hero';
import Navbar from '@/components/ui/Navbar';
import { PropsWithChildren } from 'react';
import 'styles/main.css';

export const dynamic = 'force-dynamic';
// trying to stop caching
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const meta = {
  title: 'Chat Clause',
  description: 'Use AI to summarize and chat with your documents',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  url: 'https://subscription-starter.vercel.app',
  type: 'website'
};

export const metadata = {
  title: meta.title,
  description: meta.description,
  cardImage: meta.cardImage,
  robots: meta.robots,
  favicon: meta.favicon,
  url: meta.url,
  type: meta.type,
  openGraph: {
    url: meta.url,
    title: meta.title,
    description: meta.description,
    cardImage: meta.cardImage,
    type: meta.type,
    site_name: meta.title
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vercel',
    title: meta.title,
    description: meta.description,
    cardImage: meta.cardImage
  }
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black loading">
        <SupabaseProvider>
          <Navbar />
          <Hero />
          <main id="skip">{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}

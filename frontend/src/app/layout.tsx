import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CloudDrive - Your Personal Cloud Storage',
  description: 'Secure cloud storage for all your files',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const dark = localStorage.getItem('darkMode');
                if (dark === 'true') document.documentElement.classList.add('dark');
              } catch {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-neutral-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
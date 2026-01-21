import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CloudDrive - Your Personal Cloud Storage',
  description: 'Secure cloud storage for all your files',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-neutral-100 text-gray-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

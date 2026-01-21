import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <Hero />
      </div>
    </main>
  );
}
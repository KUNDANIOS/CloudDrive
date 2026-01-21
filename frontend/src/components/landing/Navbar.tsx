'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const navbarHeight = 80; // Adjust based on your navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg 
              className="w-8 h-8 text-blue-600 transition-transform group-hover:scale-110" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
            <span className={`text-xl font-semibold transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              CloudDrive
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => handleSmoothScroll(e, '#features')}
              className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleSmoothScroll(e, '#pricing')}
              className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleSmoothScroll(e, '#about')}
              className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className={`flex gap-4 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <Link 
              href="/login" 
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
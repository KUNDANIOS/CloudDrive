'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleUpgradeClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 transform animate-bounce">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
              <p className="text-gray-600">CloudDrive+ will be available shortly. Stay tuned for exciting features!</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Hero Section */}
      <div id="features" className="relative max-w-6xl mx-auto px-8 pt-20 pb-32">
        {/* Cloud with Floating Icons */}
        <div className="flex justify-center items-center mb-12 min-h-[400px]">
          <div className={`relative w-full max-w-2xl transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            {/* Center Container */}
            <div className="relative flex justify-center items-center">
              {/* Cloud - You can replace this with your GIF */}
              <div className="relative">
                {/* OPTION 1: Use your GIF (uncomment this and comment out the SVG below) */}
                {/* <img 
                  src="/cloud-animation.gif" 
                  alt="CloudDrive Animation" 
                  className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                /> */}

                {/* OPTION 2: Use gradient SVG cloud (comment this out if using GIF) */}
                <svg className="w-64 h-64 md:w-80 md:h-80" viewBox="0 0 400 300">
                  <defs>
                    <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#60D5FA', stopOpacity: 1}} />
                      <stop offset="50%" style={{stopColor: '#2EA0D5', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#1E88E5', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <circle cx="120" cy="150" r="80" fill="url(#cloudGradient)" opacity="0.9"/>
                  <circle cx="220" cy="120" r="100" fill="url(#cloudGradient)" opacity="0.95"/>
                  <circle cx="300" cy="160" r="75" fill="url(#cloudGradient)" opacity="0.9"/>
                  <rect x="120" y="140" width="180" height="60" fill="url(#cloudGradient)" opacity="0.95"/>
                </svg>
              </div>

              {/* Floating Icons */}
              {/* Notes Icon - Top */}
              <div 
                className={`absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                style={{ 
                  animation: isLoaded ? 'float 4s ease-in-out infinite' : 'none',
                  animationDelay: '0s'
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>

              {/* Contacts Icon - Left */}
              <div 
                className={`absolute top-1/2 -left-12 -translate-y-1/2 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ 
                  animation: isLoaded ? 'float 4.5s ease-in-out infinite' : 'none',
                  animationDelay: '0.5s'
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Mail Icon - Right */}
              <div 
                className={`absolute top-1/2 -right-12 -translate-y-1/2 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{ 
                  animation: isLoaded ? 'float 4.2s ease-in-out infinite' : 'none',
                  animationDelay: '1s'
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className={`text-6xl md:text-7xl font-bold text-center mb-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          CloudDrive
        </h1>

        {/* Subheading */}
        <p className={`text-xl md:text-2xl text-gray-600 text-center max-w-3xl mx-auto mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Store, share, and access your files from anywhere. Your personal cloud storage solution.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-20 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link 
            href="/login"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-full hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-xl text-center"
          >
            Sign In
          </Link>
          <Link 
            href="/register"
            className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105 hover:shadow-xl text-center"
          >
            Create Account
          </Link>
        </div>

        {/* App Icons Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <AppIcon 
            gradient="from-yellow-400 to-pink-500"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            name="Photos"
            delay={0.6}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-blue-400 to-blue-600"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            name="Mail"
            delay={0.65}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-red-400 to-red-600"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            name="Calendar"
            delay={0.7}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-yellow-300 to-yellow-500"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            name="Notes"
            delay={0.75}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-blue-500 to-blue-700"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
            name="Files"
            delay={0.8}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-orange-400 to-red-500"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            name="Reminders"
            delay={0.85}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-gray-600 to-gray-800"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            name="Contacts"
            delay={0.9}
            isLoaded={isLoaded}
          />
          <AppIcon 
            gradient="from-green-400 to-green-600"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            name="Find My"
            delay={0.95}
            isLoaded={isLoaded}
          />
        </div>
      </div>
       
      {/* Pricing Section */}
      <div id="pricing" className="max-w-5xl mx-auto mb-20 px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Choose your plan
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16">
          Simple, transparent pricing that grows with you
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>5 GB storage</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Access on all devices</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Basic file sharing</span>
              </li>
            </ul>
            <Link 
              href="/register"
              className="block w-full py-3 px-6 text-center bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">CloudDrive+</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">$9.99</span>
              <span className="text-blue-100">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>1 TB storage</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Advanced privacy features</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Family sharing (up to 6 people)</span>
              </li>
            </ul>
            <button 
              onClick={handleUpgradeClick}
              className="block w-full py-3 px-6 text-center bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Dark Section */}
      <div id="about" className="bg-gradient-to-b from-gray-900 to-black text-white py-32">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className={`font-[system-ui,-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto,Helvetica,Arial] text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-snug sm:leading-tight max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20 transition-all duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            The best place for all your photos, files, notes, mail, and more.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Panel */}
            <div className={`bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {/* Mail */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Find My */}
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {/* Reminders */}
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200">
                    <div className="space-y-1">
                      <div className="w-8 h-1 bg-red-500 rounded"></div>
                      <div className="w-8 h-1 bg-orange-500 rounded"></div>
                      <div className="w-8 h-1 bg-yellow-500 rounded"></div>
                    </div>
                  </div>
                  {/* Notes */}
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  {/* Files */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Contacts */}
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl shadow-lg flex items-center justify-center col-start-2">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {/* Numbers */}
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  {/* Pages */}
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  {/* Photos */}
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Easily access apps and data from your Phone on the web</h3>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                CloudDrive is essential for keeping personal information from your devices safe, up to date, and available wherever you are. At CloudDrive, you can access your photos, files, and more from any web browser. Changes you make will sync to your Phone and other devices, so you're always up to date.
              </p>
            </div>

            {/* Right Panel */}
            <div className={`bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Cloud shape with overlapping circles */}
                  <svg viewBox="0 0 300 250" className="w-full h-full">
                    <defs>
                      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    
                    {/* Main cloud circles */}
                    <circle cx="150" cy="125" r="85" fill="url(#blueGrad)" opacity="0.95"/>
                    <circle cx="90" cy="125" r="70" fill="url(#blueGrad)" opacity="0.9"/>
                    <circle cx="210" cy="135" r="65" fill="url(#blueGrad)" opacity="0.9"/>
                    
                    {/* Globe/World icon - left circle */}
                    <g transform="translate(55, 90)">
                      <circle cx="35" cy="35" r="28" fill="none" stroke="white" strokeWidth="3"/>
                      <path d="M 35 7 Q 20 35 35 63" fill="none" stroke="white" strokeWidth="2.5"/>
                      <path d="M 35 7 Q 50 35 35 63" fill="none" stroke="white" strokeWidth="2.5"/>
                      <line x1="7" y1="35" x2="63" y2="35" stroke="white" strokeWidth="2.5"/>
                      <path d="M 15 20 Q 35 25 55 20" fill="none" stroke="white" strokeWidth="2"/>
                      <path d="M 15 50 Q 35 45 55 50" fill="none" stroke="white" strokeWidth="2"/>
                    </g>
                    
                    {/* Lock icon - top right circle */}
                    <g transform="translate(175, 100)">
                      <rect x="20" y="30" width="30" height="25" rx="3" fill="white"/>
                      <path d="M 25 30 V 23 Q 25 15 35 15 Q 45 15 45 23 V 30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="35" cy="42" r="3" fill="#3B82F6"/>
                    </g>
                    
                    {/* Mail icon - bottom circle */}
                    <g transform="translate(120, 155)">
                      <rect x="15" y="20" width="40" height="28" rx="4" fill="white"/>
                      <path d="M 15 23 L 35 35 L 55 23" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="50" cy="25" r="6" fill="white" stroke="#3B82F6" strokeWidth="2"/>
                    </g>
                    
                    {/* 1TB Text */}
                    <text x="150" y="135" textAnchor="middle" fill="white" fontSize="42" fontWeight="bold">1TB</text>
                  </svg>
                </div>
              </div>
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-blue-400">CloudDrive+</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">More storage, plus features to protect your privacy and connect with friends</h3>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                Upgrade to CloudDrive+ to get more storage, plan events with invites, and have peace of mind with privacy features. You can even share your subscription with your family.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppIcon = ({ gradient, icon, name, delay, isLoaded }: {
  gradient: string;
  icon: React.ReactNode;
  name: string;
  delay: number;
  isLoaded: boolean;
}) => (
  <div 
    className={`flex flex-col items-center gap-3 transition-all duration-700 hover:scale-110 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    style={{ transitionDelay: `${delay}s` }}
  >
    <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg flex items-center justify-center transition-all hover:shadow-2xl cursor-pointer`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{name}</span>
  </div>
);

export default Hero;
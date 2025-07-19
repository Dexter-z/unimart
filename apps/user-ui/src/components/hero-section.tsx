'use client'

import React from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';

const HeroSection = () => {
  const { user, isLoading } = useUser();
  return (
    <section className="w-full bg-gradient-to-br from-blue-100 via-white to-blue-50 py-10 md:py-20 flex items-center justify-center">
      <div className="w-[95%] md:w-[80%] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-20">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#1a237e] leading-tight">
            Welcome to <span className="text-[#3489FF]">Unimart UNN</span>
          </h1>
          <p className="text-base md:text-lg text-gray-700 mb-6 max-w-xl mx-auto md:mx-0">
            Your one-stop marketplace for students of University of Nigeria, Nsukka. Discover, buy, and sell everything you need on campus – fast, safe, and easy.
          </p>
          {!user && !isLoading && (
            <Link href="/sign-up">
              <button className="px-8 py-3 bg-[#3489FF] text-white font-semibold rounded-lg shadow hover:bg-[#2563eb] transition-all text-base md:text-lg">
                Get Started
              </button>
            </Link>
          )}
        </div>
        {/* Right: Image/Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/hero-campus.svg"
            alt="Unimart UNN Hero"
            className="w-[90%] md:w-[400px] max-w-xs md:max-w-md drop-shadow-xl rounded-lg"
            style={{objectFit: 'cover'}}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 
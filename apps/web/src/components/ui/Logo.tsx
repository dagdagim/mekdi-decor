import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md', className = '' }) => {
  const isLight = variant === 'light';

  const sizeClasses = {
    sm: {
      svg: 'w-7 h-7',
      title: 'text-base tracking-[0.2em]',
      tagline: 'text-[9px]',
    },
    md: {
      svg: 'w-9 h-9',
      title: 'text-xl tracking-[0.25em]',
      tagline: 'text-[10px]',
    },
    lg: {
      svg: 'w-12 h-12',
      title: 'text-2xl tracking-[0.28em]',
      tagline: 'text-xs',
    },
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group transition-opacity hover:opacity-95 ${className}`}>
      {/* Handcrafted Botanical Lotus / Arch Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 100 100"
          className={`${sizeClasses.svg} transition-transform duration-500 group-hover:scale-105`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer elegant decorative petals */}
          <path
            d="M50 15C50 15 32 36 32 58C32 68 40 76 50 76C60 76 68 68 68 58C68 36 50 15 50 15Z"
            fill={isLight ? '#F5EFEB' : '#5B1424'}
          />
          {/* Side left leaf */}
          <path
            d="M32 46C20 48 12 59 15 70C17 76 23 80 30 80C39 80 43 72 41 62C40 57 36 50 32 46Z"
            fill="#D4AF37"
            opacity="0.9"
          />
          {/* Side right leaf */}
          <path
            d="M68 46C80 48 88 59 85 70C83 76 77 80 70 80C61 80 57 72 59 62C60 57 64 50 68 46Z"
            fill="#D4AF37"
            opacity="0.9"
          />
          {/* Core royal bud */}
          <path
            d="M50 32C46 44 45 56 50 68C55 56 54 44 50 32Z"
            fill={isLight ? '#5B1424' : '#FDFBF7'}
          />
          {/* Foundation pedestal */}
          <path
            d="M26 84C38 88 62 88 74 84C70 81 30 81 26 84Z"
            fill="#D4AF37"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-editorial font-bold ${sizeClasses.title} uppercase ${
            isLight ? 'text-cream-50' : 'text-burgundy-900'
          }`}
        >
          Mekdi Decor
        </span>
        <span
          className={`font-serif italic font-normal ${sizeClasses.tagline} tracking-wider ${
            isLight ? 'text-gold-300' : 'text-gold-700'
          }`}
        >
          Making Moments Unforgettable
        </span>
      </div>
    </Link>
  );
};

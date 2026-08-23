import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconSize?: number;
  textColor?: string;
  showText?: boolean;
}

export function BrandIcon({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="18 4 68 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Body Gradient */}
        <linearGradient id="bodyGrad" x1="0%" y1="100%" x2="70%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>

        {/* Head Gradient */}
        <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Star Gradient */}
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#F59E0B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Head Circle */}
      <circle cx="47" cy="30" r="11" fill="url(#headGrad)" />

      {/* Dynamic Torso & Arm Reaching Up */}
      <path
        d="M 24 64 C 29 55 35 44 46 39 C 55 35 63 26 66 23 C 65 30 63 39 58 48 C 50 60 40 65 24 64 Z"
        fill="url(#bodyGrad)"
      />
      {/* Dynamic Extended Arc / Lower Body Accent */}
      <path
        d="M 24 64 C 36 65 47 58 55 49 C 62 40 64 30 66 23 C 68 20 64 22 61 25 C 50 35 40 46 32 55 C 27 59 25 62 24 64 Z"
        fill="#38BDF8"
        opacity="0.6"
      />

      {/* Reaching Star */}
      <g transform="translate(68, 20) rotate(12)" filter="url(#starGlow)">
        <polygon
          points="0,-15 4.5,-4.5 15.5,-4 7,4 10,15 0,8.5 -10,15 -7,4 -15.5,-4 -4.5,-4.5"
          fill="url(#starGrad)"
        />
      </g>
    </svg>
  );
}

export default function BrandLogo({
  className = '',
  iconSize = 52,
  textColor = 'text-slate-900',
  showText = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 左邊放 icon */}
      <BrandIcon size={iconSize} />

      {/* 右邊放小管家兒童理財 (不需放英文) */}
      {showText && (
        <span
          className={`font-black tracking-tight text-lg sm:text-xl md:text-2xl whitespace-nowrap leading-none ${textColor}`}
          style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
        >
          小管家兒童理財
        </span>
      )}
    </div>
  );
}

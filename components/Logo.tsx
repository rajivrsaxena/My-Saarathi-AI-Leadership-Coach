
import React from 'react';

export type LogoVariant = 'minimal' | 'neural' | 'ornate';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: LogoVariant;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = false, 
  variant = 'ornate' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const renderIcon = () => {
    const goldGradId = `gold-grad-${variant}`;
    
    const defs = (
      <defs>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="45%" stopColor="#F9E076" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
      </defs>
    );

    switch (variant) {
      case 'minimal':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2">
            {defs}
            <path d="M50 80V40" stroke={`url(#${goldGradId})`} strokeWidth="8" strokeLinecap="round" />
            <path d="M50 40C30 35 25 55 40 65" stroke={`url(#${goldGradId})`} strokeWidth="6" strokeLinecap="round" />
            <path d="M50 40C70 35 75 55 60 65" stroke={`url(#${goldGradId})`} strokeWidth="6" strokeLinecap="round" />
            <path d="M50 40L50 20" stroke={`url(#${goldGradId})`} strokeWidth="6" strokeLinecap="round" />
          </svg>
        );
      case 'neural':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1">
            {defs}
            <path d="M50 85V45" stroke={`url(#${goldGradId})`} strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="40" r="4" fill={`url(#${goldGradId})`} />
            <path d="M50 45L75 25" stroke={`url(#${goldGradId})`} strokeWidth="1" strokeDasharray="2 2" />
            <path d="M50 45L25 25" stroke={`url(#${goldGradId})`} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="75" cy="25" r="3" fill={`url(#${goldGradId})`} />
            <circle cx="25" cy="25" r="3" fill={`url(#${goldGradId})`} />
            <circle cx="80" cy="50" r="2.5" fill={`url(#${goldGradId})`} />
            <circle cx="20" cy="50" r="2.5" fill={`url(#${goldGradId})`} />
          </svg>
        );
      case 'ornate':
      default:
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-0.5">
            {defs}
            {/* Roots - Symmetric and deep */}
            <path d="M50 82C40 82 32 75 32 68" stroke={`url(#${goldGradId})`} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M50 82C60 82 68 75 68 68" stroke={`url(#${goldGradId})`} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* Trunk - Graceful and solid */}
            <path d="M50 82V45" stroke={`url(#${goldGradId})`} strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Main Tree Canopy Structure */}
            <g fill={`url(#${goldGradId})`}>
              {/* Central vertical growth */}
              <path d="M50 12C53 22 56 28 50 38C44 28 47 22 50 12Z" />
              
              {/* Upper Lateral Branches/Leaves */}
              <path d="M54 42C70 32 78 35 74 52C65 48 60 45 54 42Z" />
              <path d="M46 42C30 32 22 35 26 52C35 48 40 45 46 42Z" />
              
              {/* Mid Lateral Branches/Leaves */}
              <path d="M55 58C75 52 85 60 80 75C68 70 62 65 55 58Z" />
              <path d="M45 58C25 52 15 60 20 75C32 70 38 65 45 58Z" />
              
              {/* Small Bloom Accents */}
              <circle cx="38" cy="28" r="1.8" />
              <circle cx="62" cy="28" r="1.8" />
              <circle cx="50" cy="22" r="1.2" />
              <circle cx="22" cy="45" r="1.5" />
              <circle cx="78" cy="45" r="1.5" />
            </g>

            {/* Guiding Swirls at Base */}
            <path d="M50 82C65 82 78 72 72 58" stroke={`url(#${goldGradId})`} strokeWidth="1" strokeLinecap="round" strokeDasharray="1 3" fill="none" />
            <path d="M50 82C35 82 22 72 28 58" stroke={`url(#${goldGradId})`} strokeWidth="1" strokeLinecap="round" strokeDasharray="1 3" fill="none" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${sizes[size]} bg-white rounded-2xl shadow-2xl border border-slate-50 flex items-center justify-center overflow-hidden p-2 transition-all hover:scale-110 active:scale-95 duration-500`}>
        {renderIcon()}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
            My <span className="text-[#B8860B]">Saarathi</span>
          </span>
          <div className="flex items-center gap-2 mt-1.5">
             <div className="h-[1px] w-4 bg-[#B8860B]/30"></div>
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Tree of Leadership</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;

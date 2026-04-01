
import React from 'react';

interface Props {
  className?: string;
  size?: number;
  colored?: boolean;
}

const MissionLogo: React.FC<Props> = ({ className = "", size = 48, colored = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-lg"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="artemisBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0066b2" />
            <stop offset="100%" stopColor="#004a82" />
          </linearGradient>
          <linearGradient id="artemisOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f37021" />
            <stop offset="100%" stopColor="#c54b00" />
          </linearGradient>
          <filter id="glowSubtle">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* The Artemis "A" - Stylized */}
        <path 
          d="M50 10 L85 90" 
          stroke={colored ? "white" : "currentColor"} 
          strokeWidth="10" 
          strokeLinecap="round" 
        />
        <path 
          d="M50 10 L15 90" 
          stroke={colored ? "white" : "currentColor"} 
          strokeWidth="10" 
          strokeLinecap="round" 
        />

        {/* Blue Earth Horizon Base */}
        <path 
          d="M15 90 Q 50 78 85 90" 
          stroke={colored ? "url(#artemisBlue)" : "currentColor"} 
          strokeWidth="12" 
          strokeLinecap="round" 
        />

        {/* Rocket Orange Trajectory Swoop */}
        <path 
          d="M10 95 C 25 75, 75 75, 90 15" 
          stroke={colored ? "url(#artemisOrange)" : "currentColor"} 
          strokeWidth="6" 
          strokeLinecap="round"
          filter="url(#glowSubtle)"
          className="animate-[pulse_4s_ease-in-out_infinite]"
        />

        {/* The Moon */}
        <circle cx="90" cy="15" r="4.5" fill={colored ? "#cbd5e1" : "currentColor"} />
        <circle cx="88" cy="13" r="4" fill="#020617" className="opacity-40" />
      </svg>
    </div>
  );
};

export default MissionLogo;

import React from 'react';

export default function FloodWatchLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
      fill="none"
    >
      {/* Outer Radar Rings (AI Detection) */}
      <circle cx="50" cy="55" r="40" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 15" className="animate-[spin_10s_linear_infinite] opacity-50" />
      <circle cx="50" cy="55" r="25" stroke="#14b8a6" strokeWidth="3" strokeDasharray="6 8" className="animate-[spin_8s_linear_infinite_reverse] opacity-70" />
      
      {/* Core Water Drop (Hydrology) */}
      <path 
        d="M50 15 C50 15 25 45 25 65 C25 78.8 36.2 90 50 90 C63.8 90 75 78.8 75 65 C75 45 50 15 50 15 Z" 
        fill="url(#waterGradient)"
        filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))"
      />

      {/* Internal AI Node / Core */}
      <circle cx="50" cy="70" r="6" fill="#f87171" className="animate-pulse" />
      <path d="M50 70 L50 45" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
      
      {/* Gradients and Definitions */}
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /> {/* blue-400 */}
          <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
        </linearGradient>
      </defs>
    </svg>
  );
}
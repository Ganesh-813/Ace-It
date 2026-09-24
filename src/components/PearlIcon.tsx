import React from 'react';

interface PearlIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  animate?: boolean;
}

export const PearlIcon: React.FC<PearlIconProps> = ({
  size = 'md',
  className = '',
  animate = false,
}) => {
  let dimension = 22;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs': dimension = 14; break;
      case 'sm': dimension = 18; break;
      case 'md': dimension = 22; break;
      case 'lg': dimension = 32; break;
      case 'xl': dimension = 46; break;
    }
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${animate ? 'transition-transform duration-300 hover:scale-110 active:scale-95' : ''} ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-label="Pearls"
      role="img"
    >
      <div
        className="pearl-3d w-full h-full rounded-full relative select-none"
        style={{
          width: dimension,
          height: dimension,
        }}
      >
        {/* Soft specular pin-point highlight */}
        <div
          className="absolute rounded-full bg-white opacity-90 pointer-events-none"
          style={{
            top: '20%',
            left: '28%',
            width: Math.max(3, Math.round(dimension * 0.22)),
            height: Math.max(3, Math.round(dimension * 0.22)),
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.9)',
          }}
        />
        {/* Subtle rim glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 75% 80%, rgba(200, 215, 240, 0.45) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};

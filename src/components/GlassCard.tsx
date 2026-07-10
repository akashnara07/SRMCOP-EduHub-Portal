import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  id?: string;
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassCard({
  id,
  children,
  className = '',
  hoverLift = false,
  onClick,
  style,
}: GlassCardProps) {
  const baseStyle = `
    relative
    bg-white/65
    backdrop-blur-[30px]
    border border-white/40
    rounded-[24px]
    shadow-[0_8px_32px_rgba(31,38,135,0.06)]
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]
    transition-shadow duration-300
    overflow-hidden
  `;

  if (hoverLift) {
    return (
      <motion.div
        id={id}
        whileHover={{
          y: -6,
          scale: 1.01,
          boxShadow: '0 20px 40px rgba(31,38,135,0.12)',
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`${baseStyle} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={style}
      >
        {/* Subtle neomorphic gloss reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
        <div className="relative z-10 h-full w-full">{children}</div>
      </motion.div>
    );
  }

  return (
    <div
      id={id}
      onClick={onClick}
      className={`${baseStyle} ${onClick ? 'cursor-pointer hover:shadow-[0_12px_36px_rgba(31,38,135,0.09)]' : ''} ${className}`}
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

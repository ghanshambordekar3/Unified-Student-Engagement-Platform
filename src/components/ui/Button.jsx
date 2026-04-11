import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = ({ 
  children, 
  className = "", 
  variant = "primary", 
  size = "md",
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200",
    teal: "bg-teal-500 text-white shadow-lg hover:shadow-xl",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Subtle inner glow for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </motion.button>
  );
};

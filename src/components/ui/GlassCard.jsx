import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const GlassCard = ({ 
  children, 
  className = "", 
  hoverable = true, 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      whileHover={hoverable ? { 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      className={cn(
        "bg-white rounded-[20px] p-6 transition-all duration-300 shadow-lg border border-gray-100",
        hoverable && "hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

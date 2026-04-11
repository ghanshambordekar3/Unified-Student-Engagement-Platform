import React from "react";
import { motion } from "framer-motion";

export const ButtonAnim = ({ children, className = "", variant = "primary", ...props }) => {
  const baseStyles = "relative overflow-hidden font-semibold px-6 py-3 rounded-xl transition-colors duration-200";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/30",
    secondary: "bg-white border border-gray-200 hover:border-primary/50 text-gray-900",
    teal: "bg-teal hover:bg-teal-light text-white shadow-lg shadow-teal/30",
    outline: "border-2 border-primary text-primary hover:bg-blue-50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Optional: Add a subtle inner shine/glow here */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

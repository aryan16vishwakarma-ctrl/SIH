import React from 'react';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading KisaanConnect...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-brand-500 border-r-emerald-400"
        />
        <motion.div
          animate={{ scale: [0.85, 1.1, 0.85] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="text-brand-500"
        >
          <Sprout className="w-8 h-8 text-emerald-400" />
        </motion.div>
      </div>
      <p className="text-sm font-semibold text-slate-300 animate-pulse">{label}</p>
    </div>
  );
};

export default LoadingSpinner;

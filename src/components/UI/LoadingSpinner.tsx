import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated hearts spinner */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} relative`}
        >
          {/* Heart icons positioned in a circle */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${i * 45}deg)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            >
              <div
                className="text-pink-500"
                style={{
                  transform: `translateY(-${size === 'sm' ? '12px' : size === 'md' ? '24px' : '32px'}) rotate(-${i * 45}deg)`,
                  fontSize: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px'
                }}
              >
                ❤️
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Central glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-sm ${sizeClasses[size]}`}
        />
      </div>

      {/* Loading message */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={`text-white/70 font-medium ${textSizeClasses[size]}`}
      >
        {message}
      </motion.p>

      {/* Loading dots */}
      <div className="flex space-x-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-4, 4, -4],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner; 
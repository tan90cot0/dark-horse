import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

function Surprise() {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const handleYesClick = () => {
    setHasAnswered(true);
  };

  const moveNoButton = () => {
    if (noButtonRef.current) {
      const button = noButtonRef.current;
      const container = button.parentElement;
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        const maxX = containerRect.width - buttonRect.width;
        const maxY = containerRect.height - buttonRect.height;
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        setNoButtonPosition({ x: randomX, y: randomY });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Enhanced background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Floating hearts */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center glass-effect rounded-full px-6 py-2 border border-white/10 mb-8"
            >
              <Heart className="text-pink-400 mr-2" size={18} />
              <span className="text-base font-medium">A Special Question</span>
            </motion.div>

            {/* Main content card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-effect border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              {!hasAnswered ? (
                <>
                  {/* Question */}
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl md:text-5xl font-bold mb-8 gradient-text"
                  >
                    Will you be my coding partner forever?
                  </motion.h1>

                  {/* GIF */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12 rounded-2xl overflow-hidden max-w-md mx-auto"
                  >
                    <img
                      src="https://media.giphy.com/media/FTGah7Mx3ss04PcasF/giphy.gif"
                      alt="Cute animated character"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>

                  {/* Buttons */}
                  <div className="relative h-32 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleYesClick}
                      className="absolute left-1/2 transform -translate-x-1/2 -translate-x-24 px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-bold text-xl shadow-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Yes! 💕
                    </motion.button>

                    <motion.button
                      ref={noButtonRef}
                      onMouseEnter={moveNoButton}
                      onFocus={moveNoButton}
                      style={{
                        position: 'absolute',
                        left: `${noButtonPosition.x}px`,
                        top: `${noButtonPosition.y}px`,
                        right: 'auto',
                        transform: noButtonPosition.x === 0 && noButtonPosition.y === 0 ? 'translateX(96px)' : 'none'
                      }}
                      className="px-12 py-4 bg-white/10 border border-white/20 rounded-full text-white font-bold text-xl shadow-lg hover:bg-white/20 transition-all duration-300"
                    >
                      No 😢
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  {/* Success message */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 0.5, repeat: 3, delay: 0.5 }}
                    >
                      <Sparkles size={64} className="mx-auto mb-6 text-yellow-400" />
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                      Yay! Let's keep building amazing things together! 🎉
                    </h1>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mb-8 rounded-2xl overflow-hidden max-w-md mx-auto"
                    >
                      <img
                        src="https://media.giphy.com/media/UMon0fuimoAN9ueUNP/giphy.gif"
                        alt="Celebration"
                        className="w-full h-64 object-cover"
                      />
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-xl text-gray-300 mb-8"
                    >
                      Here's to many more coding adventures, late-night debugging sessions, 
                      and celebrating every small victory together! 💻✨
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setHasAnswered(false)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Ask me again! 😊
                    </motion.button>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Cute footer message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-sm text-gray-400 italic"
            >
              A little surprise from your coding companion 💝
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Surprise; 
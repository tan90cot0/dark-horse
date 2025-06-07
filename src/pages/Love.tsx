import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import surpriseService, { SurpriseContent } from '../services/surpriseService';

function Love() {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState<SurpriseContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Load initial content
  useEffect(() => {
    generateNewContent();
  }, []);

  const generateNewContent = async () => {
    setIsLoading(true);
    setIsGenerating(true);
    try {
      const newContent = await surpriseService.generateSurpriseContent();
      setContent(newContent);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleYesClick = () => {
    setHasAnswered(true);
  };

  const handleAskAgain = async () => {
    setHasAnswered(false);
    setNoButtonPosition({ x: 0, y: 0 }); // Reset button position
    await generateNewContent();
  };

  const moveNoButton = () => {
    if (noButtonRef.current) {
      const button = noButtonRef.current;
      const buttonRect = button.getBoundingClientRect();
      
      // Use the entire viewport as the playground
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for button size and some padding from edges
      const buttonWidth = buttonRect.width;
      const buttonHeight = buttonRect.height;
      const padding = 20;
      
      // Calculate safe movement area
      const maxX = viewportWidth - buttonWidth - padding;
      const maxY = viewportHeight - buttonHeight - padding;
      
      // Generate random position with some minimum distance from current position
      const minDistance = 100; // Minimum distance to move
      let randomX, randomY, distance;
      
      do {
        randomX = Math.floor(Math.random() * maxX) + padding;
        randomY = Math.floor(Math.random() * maxY) + padding;
        
        // Calculate distance from current position
        const currentX = noButtonPosition.x || (viewportWidth / 2);
        const currentY = noButtonPosition.y || (viewportHeight / 2);
        distance = Math.sqrt(Math.pow(randomX - currentX, 2) + Math.pow(randomY - currentY, 2));
      } while (distance < minDistance);
      
      setNoButtonPosition({ x: randomX, y: randomY });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Heart className="w-full h-full text-pink-400" />
          </motion.div>
          <p className="text-xl text-gray-300">Generating something special for you... 💕</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">Oops! Something went wrong.</p>
          <button
            onClick={generateNewContent}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              {isGenerating && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="ml-2"
                >
                  <RefreshCw size={14} className="text-purple-400" />
                </motion.div>
              )}
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
                  {/* Dynamic Question */}
                  <motion.h1
                    key={content.question} // Key for re-animation when content changes
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold mb-8 gradient-text"
                  >
                    {content.question}
                  </motion.h1>

                  {/* Dynamic GIF */}
                  <motion.div
                    key={content.questionGif} // Key for re-animation when GIF changes
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12 rounded-2xl overflow-hidden max-w-md mx-auto"
                  >
                    <img
                      src={content.questionGif}
                      alt="Cute animated character"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>

                  {/* Buttons Container - Much larger playground area */}
                  <div className="relative min-h-[300px] flex items-center justify-center">
                    {/* Yes Button - Fixed position */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleYesClick}
                      className="px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-bold text-xl shadow-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Yes! 💕
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  {/* Dynamic Success message */}
                  <motion.div
                    key={content.celebrationTitle} // Key for re-animation when content changes
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
                      {content.celebrationTitle}
                    </h1>

                    <motion.div
                      key={content.celebrationGif} // Key for re-animation when GIF changes
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mb-8 rounded-2xl overflow-hidden max-w-md mx-auto"
                    >
                      <img
                        src={content.celebrationGif}
                        alt="Celebration"
                        className="w-full h-64 object-cover"
                      />
                    </motion.div>

                    <motion.p
                      key={content.celebrationMessage} // Key for re-animation when content changes
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-xl text-gray-300 mb-8"
                    >
                      {content.celebrationMessage}
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAskAgain}
                      disabled={isGenerating}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw size={16} />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        'Ask me again! 😊'
                      )}
                    </motion.button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* No Button - Positioned absolutely to move anywhere on screen */}
      {!hasAnswered && (
        <motion.button
          ref={noButtonRef}
          onMouseEnter={moveNoButton}
          onFocus={moveNoButton}
          animate={{
            x: noButtonPosition.x,
            y: noButtonPosition.y,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{
            position: 'fixed',
            left: noButtonPosition.x === 0 ? '50%' : '0px',
            top: noButtonPosition.y === 0 ? '60%' : '0px',
            transform: noButtonPosition.x === 0 && noButtonPosition.y === 0 ? 'translate(-50%, -50%) translateX(150px)' : 'none',
            zIndex: 50,
          }}
          className="px-12 py-4 bg-white/10 border border-white/20 rounded-full text-white font-bold text-xl shadow-lg hover:bg-white/20 transition-all duration-300"
        >
          No 😢
        </motion.button>
      )}
    </div>
  );
}

export default Love; 
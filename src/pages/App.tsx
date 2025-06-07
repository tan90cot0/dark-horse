import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Us from './Us';
import Timeline from './Timeline';
import Map from './Map';
import NoticeBoard from './NoticeBoard';
import Chat from './Chat';
import Surprise from './Surprise';
import { ChatProvider } from '../context/ChatContext';
import { NotificationProvider } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

/**
 * Main App component that serves as the entry point of the application
 * Handles routing, welcome modal, and overall layout
 */
function App() {
  // State to control the visibility of the welcome modal
  const [showWelcome, setShowWelcome] = useState(false);
  // State to track if the welcome modal is being dismissed (for animation)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  
  /**
   * Effect hook to check if this is the user's first visit
   * Shows the welcome modal after a brief delay if it's the first visit
   */
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      // Show welcome modal after 1 second delay on first visit
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      // Set flag in localStorage to track that user has visited
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  /**
   * Handler for dismissing the welcome modal
   * Uses animation timing for smooth transition
   */
  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 500);
  };

  return (
    <NotificationProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-x-hidden">
            {/* Dynamic background with decorative elements */}
            <div className="fixed inset-0 z-0">
              {/* Grid lines for depth perception */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
              
              {/* Gradient overlays for atmosphere */}
              <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
              
              {/* Animated glowing orbs for romantic ambience */}
              <div className="absolute left-1/4 top-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
              <div className="absolute right-1/4 bottom-1/3 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute left-1/3 bottom-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
              
              {/* Decorative stars/dots for night sky effect */}
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/30"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Main content container with z-index to appear above background */}
            <div className="relative z-10">
              <Navbar />
              <Routes>
                <Route path="/" element={<Us />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/map" element={<Map />} />
                <Route path="/notice-board" element={<NoticeBoard />} />
                <Route path="/surprise" element={<Surprise />} />
                <Route path="/chat/:persona" element={<Chat />} />
              </Routes>
            </div>
            
            {/* Welcome Modal with AnimatePresence for smooth enter/exit animations */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                  onClick={dismissWelcome}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative max-w-lg bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-8 border border-white/10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close button */}
                    <button
                      onClick={dismissWelcome}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                    
                    {/* Welcome header */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mx-auto flex items-center justify-center mb-4">
                        <Info size={32} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Welcome to Humaara Adda</h2>
                      <p className="text-white/70">Your special place for connection & cherished memories</p>
                    </div>
                    
                    {/* Feature highlights */}
                    <div className="space-y-4 mb-6">
                      <Feature 
                        title="AI Chat Companions" 
                        description="Chat with personalized AI versions of Aryan and Prisha for technical help and creative insights."
                      />
                      <Feature 
                        title="Interactive Timeline" 
                        description="Explore our journey with a visually stunning chronological display of key moments."
                      />
                      <Feature 
                        title="Memory Map" 
                        description="Navigate through meaningful locations that have shaped our collaborative experience."
                      />
                      <Feature 
                        title="Digital Notice Board" 
                        description="Share announcements, ideas, and updates to stay connected."
                      />
                    </div>
                    
                    {/* Get started button */}
                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={dismissWelcome}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium"
                      >
                        Get Started
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      </ChatProvider>
    </NotificationProvider>
  );
}

/**
 * Feature component used in the welcome modal
 * Displays a feature title and description in a styled card
 */
interface FeatureProps {
  title: string;
  description: string;
}

function Feature({ title, description }: FeatureProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <h3 className="font-medium mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        {title}
      </h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  );
}

export default App;
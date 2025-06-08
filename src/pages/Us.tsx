import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Heart } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';

/**
 * Us component - Main landing page showing profiles of Aryan and Prisha
 * Allows users to navigate to chat with either persona
 */
function Us() {
  const navigate = useNavigate();
  const { startChat } = useChat();

  /**
   * Handle clicking on a profile to start a chat with selected persona
   * Calls startChat from context and navigates to chat page
   * @param persona - The persona to chat with ('aryan' or 'prisha')
   */
  const handleChatWith = (persona: 'aryan' | 'prisha') => {
    startChat(persona);
    navigate(`/chat/${persona}`);
  };

  /**
   * Animation variants for staggered animations
   * Container animates before children with staggered timing
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  /**
   * Animation variants for individual elements
   * Slides up from below with spring animation
   */
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Animated background elements for visual appeal */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Grid lines for depth and dimension */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] z-0"></div>
        
        {/* Animated glowing orbs for romantic ambience */}
        <div className="absolute left-1/4 top-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute right-1/4 bottom-1/3 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-1/3 bottom-1/4 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Floating hearts for romantic touch */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-pink-400/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s infinite alternate ease-in-out`,
              transform: `rotate(${Math.random() * 40 - 20}deg)`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page heading with animated gradient text */}
          <motion.div 
            className="text-center mb-20"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Welcome to Our Little Universe
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Where our hearts connect, and memories bloom
            </motion.p>
          </motion.div>

          {/* Section heading with heart icon */}
          <motion.div 
            className="flex items-center justify-center mb-16"
            variants={itemVariants}
          >
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-8 py-3 border border-white/10">
              <Heart className="text-pink-400 mr-3" />
              <span className="text-xl font-medium">Choose Your Companion</span>
            </div>
          </motion.div>

          {/* Profile card grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16"
            variants={itemVariants}
          >
            <ProfileCard
              image="/aryan.png"
              name="Aryan"
              onClick={() => handleChatWith('aryan')}
            />
            <ProfileCard
              image="/prisha.png"
              name="Prisha"
              onClick={() => handleChatWith('prisha')}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Profile card component for displaying person profiles
 * Includes hover animations and click functionality
 */
interface ProfileCardProps {
  image: string;
  name: string;
  onClick: () => void;
}

function ProfileCard({ image, name, onClick }: ProfileCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
      className="group relative overflow-hidden rounded-3xl backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-xl cursor-pointer"
      onClick={onClick}
    >
      <div className="relative p-8 flex flex-col items-center text-center">
        {/* Profile image with overlay and hover effects */}
        <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/5] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            whileHover={{ scale: 1.05 }}
          />
          
          {/* Romantic glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 mix-blend-overlay"></div>
          </div>
          
          {/* Floating hearts on hover (romantic touch) */}
          <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-pink-500"
                initial={{ y: 0, opacity: 0 }}
                animate={{ 
                  y: [-20, -80], 
                  opacity: [0, 1, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2 + i * 0.4,
                    delay: i * 0.3
                  }
                }}
                style={{
                  left: `${10 + i * 15}%`,
                  bottom: '10%',
                  fontSize: `${12 + Math.random() * 10}px`
                }}
              >
                ❤️
              </motion.div>
            ))}
          </div>
          
          {/* Chat indicator */}
          <motion.div 
            className="absolute bottom-4 right-4 z-20 bg-black/30 backdrop-blur-md rounded-full p-3"
            whileHover={{ scale: 1.1 }}
          >
            <MessageSquare size={24} className="text-white" />
          </motion.div>
        </div>
        
        {/* Name with gradient text effect - centered */}
        <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {name}
        </h3>
        
        {/* Start conversation button - centered */}
        <motion.div 
          className="flex items-center text-pink-400 font-medium"
          whileHover={{ x: 5 }}
        >
          Start Conversation <ArrowRight size={18} className="ml-2" />
        </motion.div>
      </div>
      
      {/* Bottom gradient for visual appeal */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-pink-500/20 to-transparent"></div>
    </motion.div>
  );
}

export default Us;
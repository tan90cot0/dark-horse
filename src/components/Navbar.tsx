import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Clock, MapIcon, MessageSquare, ChevronLeft, Menu, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Navbar component - Main navigation for the application
 * Handles both desktop and mobile navigation
 * Adapts based on current page and scroll position
 */
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeChat, endChat } = useChat();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we're in a chat page
  const isChatPage = location.pathname.startsWith('/chat/');
  
  // Handle back button in chat
  const handleBackFromChat = () => {
    endChat();
    navigate('/');
  };
  
  // Calculate which nav item is active
  const isUsActive = location.pathname === '/';
  const isTimelineActive = location.pathname === '/timeline';
  const isMapActive = location.pathname === '/map';
  const isNoticeBoardActive = location.pathname === '/notice-board';

  // Detect scroll for navbar transparency effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  if (isChatPage) {
    return (
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed w-full top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto flex items-center h-16 px-6">
          {/* Left section with back button */}
          <div className="flex-none">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackFromChat}
              className="flex items-center text-white font-medium bg-white/10 backdrop-blur-md py-2 px-4 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="ml-1">Back</span>
            </motion.button>
          </div>
          
          {/* Center section with navigation links only */}
          <div className="flex-grow flex justify-center items-center">
            {/* Navigation links */}
            <div className="flex items-center justify-center space-x-12">
              <NavLink to="/" icon={<Users />} text="Us" isActive={isUsActive} />
              <NavLink to="/timeline" icon={<Clock />} text="Timeline" isActive={isTimelineActive} />
              <NavLink to="/map" icon={<MapIcon />} text="Map" isActive={isMapActive} />
              <NavLink to="/notice-board" icon={<MessageSquare />} text="Notice Board" isActive={isNoticeBoardActive} />
            </div>
          </div>
          
          {/* Right section - empty for balance */}
          <div className="flex-none w-[100px]"></div>
        </div>
      </motion.nav>
    );
  }
  
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/70 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center">
          <Link to="/" className="text-white font-bold text-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Humaara Adda
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-12">
          <NavLink to="/" icon={<Users />} text="Us" isActive={isUsActive} />
          <NavLink to="/timeline" icon={<Clock />} text="Timeline" isActive={isTimelineActive} />
          <NavLink to="/map" icon={<MapIcon />} text="Map" isActive={isMapActive} />
          <NavLink to="/notice-board" icon={<MessageSquare />} text="Notice Board" isActive={isNoticeBoardActive} />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center py-4 space-y-6">
              <MobileNavLink 
                to="/" 
                icon={<Users />} 
                text="Us" 
                isActive={isUsActive} 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink 
                to="/timeline" 
                icon={<Clock />} 
                text="Timeline" 
                isActive={isTimelineActive} 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink 
                to="/map" 
                icon={<MapIcon />} 
                text="Map" 
                isActive={isMapActive} 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink 
                to="/notice-board" 
                icon={<MessageSquare />} 
                text="Notice Board"
                isActive={isNoticeBoardActive} 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/**
 * NavLink component for desktop navigation
 */
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

function NavLink({ to, icon, text, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col items-center"
    >
      <div className={`flex flex-col items-center transition-all duration-300 ${
        isActive ? 'text-white' : 'text-white/70 hover:text-white'
      }`}>
        <div className="text-xl mb-1">{icon}</div>
        <span className="text-sm font-medium">{text}</span>
      </div>
      
      {/* Animated underline */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
}

/**
 * MobileNavLink component for mobile navigation
 */
interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ to, icon, text, isActive, onClick }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 w-full px-6 py-2 ${
        isActive 
          ? 'text-white bg-white/10 backdrop-blur-md' 
          : 'text-white/70'
      }`}
      onClick={onClick}
    >
      <div>{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>
  );
}

export default Navbar;
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

/**
 * Props for the ChatInput component
 */
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * ChatInput component - Provides the message input field
 * and send button for the chat interface
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Type a message...'
}) => {
  // State to store the current message text
  const [message, setMessage] = useState('');
  
  // State to control emoji picker visibility
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Reference to the textarea element for auto-resizing
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Reference to the emoji button for positioning the picker
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Auto-resize the textarea based on content
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  /**
   * Handle form submission and send the message
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  /**
   * Handle keyboard events for message submission
   * Enter key sends message, Shift+Enter creates a new line
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  /**
   * Toggle emoji picker visibility
   */
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  /**
   * Handle emoji selection
   */
  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };
  
  /**
   * Close emoji picker when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showEmojiPicker && 
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(e.target as Node)
      ) {
        // Check if the click is within the emoji picker
        const emojiPicker = document.querySelector('.emoji-picker');
        if (emojiPicker && !emojiPicker.contains(e.target as Node)) {
          setShowEmojiPicker(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Button hover animation
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.1 }
  };

  // Send button variants for different states
  const sendButtonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.1, rotate: 0 },
    loading: { rotate: 360, transition: { repeat: Infinity, duration: 1, ease: "linear" } }
  };

  return (
    <div className="border-t border-white/10 p-4 bg-black/30 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-2">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 placeholder-white/40"
              rows={1}
            />
            
            <div className="absolute right-3 bottom-2">
              <motion.button 
                ref={emojiButtonRef}
                type="button"
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                className="p-1.5 text-white/60 hover:text-white relative"
                onClick={toggleEmojiPicker}
              >
                <Smile size={18} />
              </motion.button>
              
              {showEmojiPicker && (
                <div 
                  className="absolute bottom-10 right-0 z-50 emoji-picker"
                  style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                >
                  <Picker 
                    data={data} 
                    onEmojiSelect={handleEmojiSelect}
                    theme="dark"
                    set="native"
                    previewPosition="none"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-none">
            <motion.button 
              type="submit"
              variants={sendButtonVariants}
              initial="idle"
              whileHover={isLoading ? "loading" : "hover"}
              animate={isLoading ? "loading" : "idle"}
              disabled={!message.trim() || isLoading}
              className={`p-3 rounded-full ${
                message.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interface for message objects in the chat
 */
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * Props for the ChatInterface component
 */
interface ChatInterfaceProps {
  name: string;
  avatar: string;
  onClose: () => void;
  sendMessage: (message: string) => Promise<string>;
  showBackButton?: boolean;
}

/**
 * ChatInterface component - Handles the main chat functionality
 * Displays messages and provides input for new messages
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  name,
  avatar,
  onClose,
  sendMessage,
  showBackButton = true
}) => {
  // State to store chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi there! I'm ${name}. How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  // State to track when a message is being processed
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to automatically scroll to the bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handles sending a new message and getting a response
   * @param content - The message text to send
   */
  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get response from API
      const response = await sendMessage(content);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Add error message if request fails
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-black relative">
      {/* Messages with additional top margin to avoid navbar overlap */}
      <div className="flex-grow p-4 overflow-y-auto relative z-10 max-w-3xl mx-auto w-full mt-16">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble
                  message={message.content}
                  isUser={message.isUser}
                  avatar={avatar}
                  timestamp={message.timestamp}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble
                message=""
                isUser={false}
                avatar={avatar}
                timestamp={new Date()}
                isTyping={true}
              />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto w-full"
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={`Message ${name}...`}
        />
      </motion.div>
    </div>
  );
};

export default ChatInterface;
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatInterface from '../components/Chat/ChatInterface';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';
import { MessageSquare, User } from 'lucide-react';

/**
 * Chat page component - Renders the chat interface with the selected persona
 * Includes the navbar and handles routing
 */
function Chat() {
  const { persona } = useParams<{ persona: 'aryan' | 'prisha' }>();
  const { sendMessage, endChat } = useChat();
  const navigate = useNavigate();

  /**
   * Handle closing the chat and returning to home page
   */
  const handleClose = () => {
    endChat();
    navigate('/');
  };

  // If no persona is specified, show persona selection
  if (!persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
        {/* Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Choose Your Chat Companion</h1>
              <p className="text-gray-400">Select who you'd like to chat with</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat/aryan')}
                className="glass-effect border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat with Aryan</h3>
                <p className="text-gray-400 text-sm">Technical discussions and project insights</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat/prisha')}
                className="glass-effect border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat with Prisha</h3>
                <p className="text-gray-400 text-sm">Creative conversations and friendly chats</p>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Safety check - if invalid persona, redirect to chat selection
  if (persona !== 'aryan' && persona !== 'prisha') {
    navigate('/chat');
    return null;
  }

  // Define persona details
  const personaDetails = {
    aryan: {
      name: 'Aryan',
      avatar: '/aryan.png'
    },
    prisha: {
      name: 'Prisha',
      avatar: '/prisha.png'
    }
  };

  const { name, avatar } = personaDetails[persona];

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow overflow-hidden">
        <ChatInterface 
          name={name}
          avatar={avatar}
          onClose={handleClose}
          sendMessage={sendMessage}
          showBackButton={true}
        />
      </div>
    </div>
  );
}

export default Chat;
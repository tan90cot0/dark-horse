import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatInterface from '../components/Chat/ChatInterface';
import { useChat } from '../context/ChatContext';
import Navbar from '../components/Navbar';

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

  // Safety check - if no valid persona, redirect to home
  if (!persona || (persona !== 'aryan' && persona !== 'prisha')) {
    navigate('/');
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
      <div className="flex-shrink-0">
        <Navbar />
      </div>
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
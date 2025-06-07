import React, { createContext, useContext, useState, ReactNode } from 'react';
import chatAPI from '../services/api';

type Persona = 'aryan' | 'prisha' | null;

interface ChatContextType {
  activeChat: Persona;
  startChat: (persona: Persona) => void;
  endChat: () => void;
  sendMessage: (message: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Persona>(null);

  const startChat = (persona: Persona) => {
    setActiveChat(persona);
  };

  const endChat = () => {
    setActiveChat(null);
  };

  const sendMessage = async (message: string): Promise<string> => {
    if (!activeChat) {
      throw new Error("No active chat");
    }
    
    return await chatAPI.chatWithPersona(activeChat, message);
  };

  return (
    <ChatContext.Provider value={{ activeChat, startChat, endChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
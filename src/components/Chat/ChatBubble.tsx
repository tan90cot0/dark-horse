import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  avatar?: string;
  timestamp: Date;
  isTyping?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  avatar,
  timestamp,
  isTyping = false
}) => {
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="relative">
            <img 
              src={avatar} 
              className="w-10 h-10 rounded-full object-cover border border-white/20"
              alt="Avatar" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-black"></div>
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-blue-700 text-white' 
          : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white'
      }`}
      >
        {isTyping ? (
          <div className="flex space-x-2 my-1 justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
          </div>
        )}
        
        <div className="flex items-center mt-2 opacity-70">
          <span className="text-xs">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <span className="ml-2 flex items-center text-xs">
              <Check size={12} className="mr-1" />
              Delivered
            </span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <span className="font-medium">You</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
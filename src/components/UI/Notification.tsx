import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  isVisible,
  onClose
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-green-600 border-green-400/20';
      case 'error':
        return 'from-red-500 to-red-600 border-red-400/20';
      case 'warning':
        return 'from-yellow-500 to-yellow-600 border-yellow-400/20';
      case 'info':
      default:
        return 'from-blue-500 to-blue-600 border-blue-400/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0`}
        >
          <div className={`bg-gradient-to-r ${getStyles()} p-4 rounded-lg shadow-2xl backdrop-blur-lg border`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 text-white">
                {getIcon()}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{title}</p>
                {message && (
                  <p className="mt-1 text-sm text-white/90">{message}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="inline-flex text-white/70 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 
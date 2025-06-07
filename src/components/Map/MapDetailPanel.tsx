import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, X } from 'lucide-react';
import { Marker } from '../../data/mapData';

interface MapDetailPanelProps {
  marker: Marker | null;
  onClose: () => void;
}

const MapDetailPanel: React.FC<MapDetailPanelProps> = ({ marker, onClose }) => {
  if (!marker) return null;
  
  const { popup } = marker;
  
  const handleAlbumClick = () => {
    window.open(popup.album_link, '_blank', 'noopener,noreferrer');
  };
  
  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      y: 50,
      transition: { 
        duration: 0.2
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={panelVariants}
      className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10"
    >
      <div className="relative">
        {/* Header image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={popup.image.src}
            alt={popup.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X size={18} />
          </button>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-2xl font-bold text-white mb-1">{popup.name}</h3>
            <div className="flex items-center text-white/70">
              <Calendar size={14} className="mr-1" />
              <span className="text-sm">{popup.date}</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start mb-4">
            <div className="p-2 bg-white/5 rounded-full mr-3">
              <MapPin size={18} className="text-purple-400" />
            </div>
            <p className="text-white/90 text-sm">
              {marker.position.lat.toFixed(6)}, {marker.position.lng.toFixed(6)}
            </p>
          </div>
          
          <p className="text-white/80 mb-6 text-sm leading-relaxed">{popup.description}</p>
          
          <button
            onClick={handleAlbumClick}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            View Photo Album
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MapDetailPanel;
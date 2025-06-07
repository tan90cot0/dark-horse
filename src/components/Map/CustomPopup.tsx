import React from 'react';
import { Marker as MapMarker } from '../../data/mapData';
import { Calendar, ExternalLink } from 'lucide-react';

interface CustomPopupProps {
  marker: MapMarker;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ marker }) => {
  const { popup } = marker;
  
  const handleAlbumClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(popup.album_link, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="custom-popup max-w-sm">
      <h3 className="text-lg font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        {popup.name}
      </h3>
      
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Calendar size={12} className="mr-1" />
        <span>{popup.date}</span>
      </div>
      
      <div className="mb-3">
        <img
          src={popup.image.src}
          alt={popup.image.alt || popup.name}
          className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          style={{ 
            maxWidth: '100%',
            maxHeight: '200px',
            objectFit: 'cover'
          }}
        />
      </div>
      
      <p className="text-sm text-gray-700 mb-3">{popup.description}</p>
      
      <button
        onClick={handleAlbumClick}
        className="flex items-center justify-center w-full text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
      >
        <ExternalLink size={14} className="mr-1" />
        View Photo Album
      </button>
    </div>
  );
};

export default CustomPopup;
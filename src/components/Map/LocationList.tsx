import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Marker } from '../../data/mapData';

interface CategoryGroupProps {
  title: string;
  markers: Marker[];
  selectedMarkerId: string | null;
  onMarkerClick: (markerId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  title,
  markers,
  selectedMarkerId,
  onMarkerClick,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
      >
        <span className="font-medium">{title} ({markers.length})</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 space-y-2 pl-2"
        >
          {markers.map(marker => (
            <motion.div
              key={marker.id}
              whileHover={{ x: 5 }}
              onClick={() => onMarkerClick(marker.id)}
              className={`p-2 rounded-lg cursor-pointer ${
                marker.id === selectedMarkerId 
                  ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-white/10' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <div className="mr-3 p-1.5 rounded-full bg-white/5">
                  <MapPin size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{marker.popup.name}</p>
                  <p className="text-xs text-white/60">{marker.popup.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface LocationListProps {
  markers: Marker[];
  selectedMarkerId: string | null;
  onMarkerClick: (markerId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const LocationList: React.FC<LocationListProps> = ({
  markers,
  selectedMarkerId,
  onMarkerClick,
  searchQuery,
  onSearchChange
}) => {
  // Track expanded category groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Recent: true, // Recent locations expanded by default
  });
  
  // Toggle a category group
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Get recent markers (last 5)
  const recentMarkers = [...markers].slice(-5);
  
  // Alphabetically categorize markers
  const categorizedMarkers = markers.reduce((acc, marker) => {
    const firstChar = marker.popup.name.charAt(0).toUpperCase();
    if (!acc[firstChar]) {
      acc[firstChar] = [];
    }
    acc[firstChar].push(marker);
    return acc;
  }, {} as Record<string, Marker[]>);
  
  // Sort category names
  const sortedCategories = Object.keys(categorizedMarkers).sort();
  
  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/50"
          />
        </div>
      </div>
      
      {/* Markers list */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Recent locations */}
        <CategoryGroup
          title="Recent Locations"
          markers={recentMarkers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={onMarkerClick}
          isExpanded={expandedGroups['Recent'] || false}
          onToggle={() => toggleGroup('Recent')}
        />
        
        {/* Alphabetical categories */}
        {sortedCategories.map(category => (
          <CategoryGroup
            key={category}
            title={category}
            markers={categorizedMarkers[category]}
            selectedMarkerId={selectedMarkerId}
            onMarkerClick={onMarkerClick}
            isExpanded={expandedGroups[category] || false}
            onToggle={() => toggleGroup(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default LocationList;
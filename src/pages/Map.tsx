import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Search, Plus, MapPin, List, X, Edit, Save, Trash2 } from 'lucide-react';
import { getMapData, MapData, Marker } from '../data/mapData';
import LeafletMap from '../components/Map/LeafletMap';
import LocationList from '../components/Map/LocationList';
import MapDetailPanel from '../components/Map/MapDetailPanel';
import AddEditMarkerModal from '../components/Map/AddEditMarkerModal';
import { useNotification } from '../context/NotificationContext';
import '../components/Map/map.css';

function Map() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showMobileList, setShowMobileList] = useState(false);
  
  // Add/Edit functionality state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  
  const { showSuccess, showError } = useNotification();

  // Load map data
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const data = await getMapData();
        setMapData(data);
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMapData();
  }, []);

  // Set selected marker when selectedMarkerId changes
  useEffect(() => {
    if (selectedMarkerId && mapData) {
      const marker = mapData.markers.find(m => m.id === selectedMarkerId) || null;
      setSelectedMarker(marker);
    } else {
      setSelectedMarker(null);
    }
  }, [selectedMarkerId, mapData]);

  // Check window size to determine view mode
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth >= 768 ? 'desktop' : 'mobile');
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle marker click
  const handleMarkerClick = (markerId: string) => {
    setSelectedMarkerId(markerId);
    
    // On mobile, show the detail panel and hide the list
    if (viewMode === 'mobile') {
      setShowMobileList(false);
    }
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Filter markers based on search query
  const filteredMarkers = mapData ? mapData.markers.filter(marker => 
    marker.popup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    marker.popup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    marker.popup.date.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Add new marker
  const handleAddMarker = () => {
    setShowAddEditModal(true);
  };

  // Edit existing marker
  const handleEditMarker = (marker: Marker) => {
    setEditingMarker(marker);
    setShowAddEditModal(true);
  };

  // Save marker (add or edit)
  const handleSaveMarker = async (markerData: Partial<Marker>) => {
    if (!mapData) return;

    try {
      let updatedMarkers = [...mapData.markers];
      
      if (editingMarker) {
        // Edit existing marker
        const index = updatedMarkers.findIndex(m => m.id === editingMarker.id);
        if (index !== -1) {
          updatedMarkers[index] = { ...editingMarker, ...markerData } as Marker;
          showSuccess('Marker updated!', 'The location has been successfully updated.');
        }
      } else {
        // Add new marker
        const newMarker: Marker = {
          id: `marker_${Date.now()}`,
          position: markerData.position || { lat: 0, lng: 0 },
          popup: {
            name: markerData.popup?.name || 'New Location',
            date: markerData.popup?.date || new Date().toDateString(),
            description: markerData.popup?.description || 'A memorable place',
            album_link: markerData.popup?.album_link || '',
            image: markerData.popup?.image || {
              src: 'https://via.placeholder.com/300x200?text=No+Image',
              alt: 'No image available',
              width: 300,
              height: 200
            }
          }
        };
        updatedMarkers.push(newMarker);
        showSuccess('Marker added!', 'New location has been added to the map.');
      }

      setMapData({
        ...mapData,
        markers: updatedMarkers
      });
      
      setShowAddEditModal(false);
      setEditingMarker(null);
    } catch (error) {
      console.error('Error saving marker:', error);
      showError('Save failed', 'Failed to save the marker. Please try again.');
    }
  };

  // Delete marker
  const handleDeleteMarker = async (markerId: string) => {
    if (!mapData) return;

    const marker = mapData.markers.find(m => m.id === markerId);
    if (!marker) return;

    if (confirm(`Are you sure you want to delete "${marker.popup.name}"? This action cannot be undone.`)) {
      try {
        const updatedMarkers = mapData.markers.filter(m => m.id !== markerId);
        setMapData({
          ...mapData,
          markers: updatedMarkers
        });
        
        setSelectedMarkerId(null);
        showSuccess('Marker deleted', 'The location has been removed from the map.');
      } catch (error) {
        console.error('Error deleting marker:', error);
        showError('Delete failed', 'Failed to delete the marker. Please try again.');
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading || !mapData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] z-0"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-full px-6 py-2 border border-white/10 mb-6"
            >
              <MapIcon className="text-purple-400 mr-2" size={18} />
              <span className="text-base font-medium">Our Places</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Memory Map
              </span>
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto">
              Explore the places that have shaped our journey together.
            </p>
          </motion.div>
          
          {/* Mobile View Toggler */}
          {viewMode === 'mobile' && (
            <div className="mb-4 flex justify-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileList(!showMobileList)}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white"
              >
                {showMobileList ? (
                  <>
                    <X size={16} />
                    <span>Close List</span>
                  </>
                ) : (
                  <>
                    <List size={16} />
                    <span>View Locations</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddMarker}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-500/30 rounded-full px-6 py-2 text-white"
              >
                <Plus size={16} />
                <span>Add Location</span>
              </motion.button>
            </div>
          )}
          
          {/* Desktop Add Button */}
          {viewMode === 'desktop' && (
            <div className="mb-4 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddMarker}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-500/30 rounded-full px-8 py-3 text-white font-medium shadow-lg"
              >
                <Plus size={20} />
                <span>Add New Location</span>
              </motion.button>
            </div>
          )}
          
          {/* Main Content */}
          <motion.div
            variants={itemVariants} 
            className="relative grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Locations List - Desktop (left side) & Mobile (full screen overlay) */}
            <AnimatePresence>
              {(viewMode === 'desktop' || (viewMode === 'mobile' && showMobileList)) && (
                <motion.div
                  initial={viewMode === 'mobile' ? { opacity: 0, y: 20 } : false}
                  animate={viewMode === 'mobile' ? { opacity: 1, y: 0 } : false}
                  exit={viewMode === 'mobile' ? { opacity: 0, y: 20 } : false}
                  className={`
                    ${viewMode === 'mobile' ? 'absolute inset-0 z-30' : 'lg:col-span-1'} 
                    bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl h-96 md:h-[36rem]
                  `}
                >
                  <LocationList
                    markers={filteredMarkers}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerClick={handleMarkerClick}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Map Container */}
            <div className={`${viewMode === 'desktop' ? 'lg:col-span-2' : 'col-span-1'} bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl h-96 md:h-[36rem] relative`}>
              {mapData && (
                <LeafletMap
                  mapData={mapData}
                  selectedMarkerId={selectedMarkerId}
                  onMarkerClick={handleMarkerClick}
                />
              )}
              
              {/* Detail Panel */}
              <AnimatePresence>
                {selectedMarker && (
                  <MapDetailPanel
                    marker={selectedMarker}
                    onClose={() => setSelectedMarkerId(null)}
                    onEdit={() => handleEditMarker(selectedMarker)}
                    onDelete={() => handleDeleteMarker(selectedMarker.id)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Legend */}
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <MapPin className="text-blue-500 mr-2" size={16} />
              <span className="text-sm">Memory</span>
            </div>
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <span className="text-sm text-white/70">{mapData.markers.length} locations mapped</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Add/Edit Marker Modal */}
      <AddEditMarkerModal
        isOpen={showAddEditModal}
        onClose={() => {
          setShowAddEditModal(false);
          setEditingMarker(null);
        }}
        onSave={handleSaveMarker}
        marker={editingMarker}
      />
    </div>
  );
}

export default Map;
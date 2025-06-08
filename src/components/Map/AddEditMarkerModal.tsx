import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Marker } from '../../data/mapData';

interface AddEditMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (markerData: Partial<Marker>) => void;
  marker?: Marker | null;
  position?: { lat: number; lng: number } | null;
}

const AddEditMarkerModal: React.FC<AddEditMarkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  marker,
  position
}) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    albumLink: '',
    imageUrl: '',
    imageAlt: '',
    imageWidth: 300,
    imageHeight: 200,
    latitude: 0,
    longitude: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when modal opens or marker changes
  useEffect(() => {
    if (isOpen) {
      if (marker) {
        // Edit mode - populate with existing data
        setFormData({
          name: marker.popup.name,
          date: marker.popup.date,
          description: marker.popup.description,
          albumLink: marker.popup.album_link,
          imageUrl: marker.popup.image.src,
          imageAlt: marker.popup.image.alt,
          imageWidth: marker.popup.image.width,
          imageHeight: marker.popup.image.height,
          latitude: marker.position.lat,
          longitude: marker.position.lng
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: '',
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          description: '',
          albumLink: '',
          imageUrl: 'https://via.placeholder.com/300x200?text=No+Image',
          imageAlt: 'Location image',
          imageWidth: 300,
          imageHeight: 200,
          latitude: 0,
          longitude: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, marker]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.albumLink && !formData.albumLink.startsWith('http')) {
      newErrors.albumLink = 'Album link must be a valid URL';
    }
    
    if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
      newErrors.imageUrl = 'Image URL must be a valid URL';
    }

    // Validate coordinates
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const markerData: Partial<Marker> = {
        popup: {
          name: formData.name.trim(),
          date: formData.date,
          description: formData.description.trim(),
          album_link: formData.albumLink,
          image: {
            src: formData.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
            alt: formData.imageAlt || formData.name,
            width: formData.imageWidth,
            height: formData.imageHeight
          }
        },
        position: {
          lat: formData.latitude,
          lng: formData.longitude
        }
      };
      
      await onSave(markerData);
      onClose();
    } catch (error) {
      console.error('Error saving marker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {marker ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Coordinates */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center text-sm text-white/70 mb-2">
                <MapPin size={14} className="mr-2 text-purple-400" />
                <span className="font-medium">Coordinates</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-purple-500 transition-colors"
                    placeholder="28.6139"
                  />
                  {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>}
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-purple-500 transition-colors"
                    placeholder="77.2088"
                  />
                  {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude}</p>}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Location Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                  placeholder="Enter location name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                  placeholder="e.g., 6 Nov 2022"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400 h-24 resize-none"
                  placeholder="Describe this memorable place..."
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Album Link */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Photo Album Link</label>
                <input
                  type="url"
                  value={formData.albumLink}
                  onChange={(e) => handleInputChange('albumLink', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                  placeholder="https://photos.app.goo.gl/..."
                />
                {errors.albumLink && <p className="text-red-400 text-xs mt-1">{errors.albumLink}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl}</p>}
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Image Preview</label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-white/20"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {marker ? 'Update' : 'Add'} Location
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEditMarkerModal; 
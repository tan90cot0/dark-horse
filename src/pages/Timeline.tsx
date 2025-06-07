import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Star, ChevronRight, ChevronLeft, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import dataService, { TimelineEvent } from '../utils/dataService';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: '',
    isHighlight: false
  });
  
  const { showSuccess, showError, showInfo } = useNotification();
  
  // Load data using our data service
  useEffect(() => {
    const loadTimelineEvents = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getTimelineEvents();
        setEvents(data);
        setError(null);
        if (data.length === 0) {
          showInfo('Timeline is empty', 'Start adding your memories!');
        }
      } catch (error) {
        console.error('Error loading timeline events:', error);
        setError('Failed to load timeline events. Please try again later.');
        showError('Failed to load timeline', 'Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTimelineEvents();
  }, [showError, showInfo]);
  
  // Handlers for carousel navigation
  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex < events.length - 1 ? prevIndex + 1 : prevIndex));
  };
  
  // Modal handlers
  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      isHighlight: false
    });
    setShowModal(true);
  };

  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      image: event.image,
      isHighlight: event.isHighlight || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      image: '',
      isHighlight: false
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title required', 'Please enter a title for your memory.');
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await dataService.updateTimelineEvent(editingEvent.id, formData);
        if (updatedEvent) {
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === editingEvent.id ? updatedEvent : event
            )
          );
          showSuccess('Memory updated!', 'Your timeline has been updated successfully.');
        }
      } else {
        // Add new event
        const newEvent = await dataService.addTimelineEvent(formData);
        setEvents(prevEvents => [...prevEvents, newEvent]);
        showSuccess('Memory added!', 'Your new memory has been added to the timeline.');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Save failed', 'Could not save your memory. Please try again.');
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      try {
        const success = await dataService.deleteTimelineEvent(id);
        if (success) {
          setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
          showSuccess('Memory deleted', 'The memory has been removed from your timeline.');
          
          // Adjust active index if necessary
          if (activeIndex >= events.length - 1) {
            setActiveIndex(Math.max(0, events.length - 2));
          }
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        showError('Delete failed', 'Could not delete the memory. Please try again.');
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
  
  // Image component with error handling
  const TimelineImage = ({ src, alt, className, onError }: { 
    src: string; 
    alt: string; 
    className: string; 
    onError?: () => void;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageError = () => {
      setImageError(true);
      setIsLoading(false);
      onError?.();
    };

    const handleImageLoad = () => {
      setIsLoading(false);
    };

    if (!src || imageError) {
      return (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
          <div className="text-center">
            <ImageIcon size={48} className="mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-sm">No image available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center absolute inset-0`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}
        <img 
          src={src} 
          alt={alt}
          className={className}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner message="Loading your memories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8 glass-effect rounded-lg border border-white/10 max-w-md">
          <div className="text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Timeline</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Enhanced background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] z-0"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced header */}
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center glass-effect rounded-full px-6 py-2 border border-white/10 mb-6"
            >
              <Calendar className="text-purple-400 mr-2" size={18} />
              <span className="text-base font-medium">Our Journey</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Timeline of Memories
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto mb-8">
              A chronological journey through our key moments and milestones.
            </p>
            
            {/* Add event button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              Add Memory
            </motion.button>
          </motion.div>
          
          {/* Content based on events availability */}
          {events.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              variants={itemVariants}
            >
              <div className="glass-effect rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                <Calendar size={64} className="mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold mb-4">No Memories Yet</h3>
                <p className="text-gray-300 mb-6">Start building your timeline by adding your first memory!</p>
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Add First Memory
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Mobile Timeline (Carousel) */}
              <div className="md:hidden mb-10">
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-effect border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                  >
                    <div className="relative aspect-video">
                      <TimelineImage
                        src={events[activeIndex].image} 
                        alt={events[activeIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      {events[activeIndex].isHighlight && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-md rounded-full px-3 py-1 text-xs flex items-center">
                          <Star size={12} className="mr-1" /> Highlight
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <button 
                          onClick={() => handleDeleteEvent(events[activeIndex].id)}
                          className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all duration-300"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => openEditModal(events[activeIndex])}
                          className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all duration-300"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 p-6">
                        <div className="text-purple-300 mb-1 text-sm">{events[activeIndex].date}</div>
                        <h3 className="text-2xl font-bold mb-2">{events[activeIndex].title}</h3>
                        <p className="text-white/80 text-sm">{events[activeIndex].description}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Navigation arrows */}
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      className="p-3 rounded-full glass-effect border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all duration-300"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="text-center">
                      <span className="text-sm text-gray-300">
                        {activeIndex + 1} of {events.length}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleNext}
                      disabled={activeIndex === events.length - 1}
                      className="p-3 rounded-full glass-effect border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all duration-300"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Timeline (Vertical) */}
              <div className="hidden md:block">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 timeline-line"></div>
                  
                  <div className="space-y-12">
                    {events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                          <div className="glass-effect border border-white/10 rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-300">
                            <div className="relative aspect-video">
                              <TimelineImage
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                              
                              {event.isHighlight && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-md rounded-full px-3 py-1 text-xs flex items-center">
                                  <Star size={12} className="mr-1" /> Highlight
                                </div>
                              )}
                              
                              <div className="absolute top-4 left-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-red-600 hover:text-white transition-all duration-300"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button 
                                  onClick={() => openEditModal(event)}
                                  className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-blue-600 hover:text-white transition-all duration-300"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 p-6">
                                <div className="text-purple-300 mb-1 text-sm">{event.date}</div>
                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                <p className="text-white/80 text-sm line-clamp-2">{event.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Timeline dot */}
                        <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-gray-900 shadow-lg">
                          <div className="absolute inset-1 rounded-full bg-white/20 animate-pulse"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Modal for adding/editing events */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-effect border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingEvent ? 'Edit Memory' : 'Add New Memory'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                  placeholder="Enter a title for this memory"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors h-24 resize-none"
                  placeholder="Describe this memory..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.isHighlight}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHighlight: e.target.checked }))}
                  className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="highlight" className="text-sm font-medium">
                  Mark as highlight
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
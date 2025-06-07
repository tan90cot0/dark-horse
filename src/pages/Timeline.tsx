import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Plus, Heart, X, Save, Edit, Image as ImageIcon, ChevronLeft, ChevronRight, Sparkles, Loader } from 'lucide-react';
import dataService, { TimelineEvent } from '../utils/dataService';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

// Improved Image Component with intersection observer - adapted from old code
const TimelineImage = React.memo(({ 
  event, 
  className,
  onImageClick
}: { 
  event: TimelineEvent; 
  className: string;
  onImageClick?: (imageData: string, title: string) => void;
}) => {
  const [imageData, setImageData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection observer for better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  // Load image only when needed
  useEffect(() => {
    if (shouldLoad && !imageData && !isLoading && !hasError) {
      loadImage();
    }
  }, [shouldLoad, imageData, isLoading, hasError]);

  const loadImage = async () => {
    setIsLoading(true);
    try {
      const image = await dataService.loadImageForEvent(event);
      if (image) {
        setImageData(image);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error(`Error loading image for ${event.id}:`, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    if (imageData && onImageClick) {
      onImageClick(imageData, event.title);
    }
  };

  return (
    <div ref={imgRef} className="relative">
      {!imageData && !isLoading && !hasError && (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
          <div className="text-center">
            <ImageIcon size={32} className="mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-xs">Image ready to load</p>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
          <div className="text-center">
            <Loader className="animate-spin h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-gray-400 text-xs">Loading image...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}>
          <div className="text-center">
            <ImageIcon size={32} className="mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-xs">Image unavailable</p>
          </div>
        </div>
      )}
      
      {imageData && !isLoading && (
        <img 
          src={imageData.startsWith('data:image') ? imageData : `data:image/jpeg;base64,${imageData}`}
          alt={event.title}
          className={`${className} ${onImageClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          onError={() => setHasError(true)}
          onClick={handleImageClick}
          loading="lazy"
        />
      )}
    </div>
  );
});

// Expandable Text Component
const ExpandableText = React.memo(({ text, maxLength = 300 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <span className="text-white/80 text-sm leading-relaxed">{text}</span>;
  }

  return (
    <div className="text-white/80 text-sm leading-relaxed">
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-purple-400 hover:text-purple-300 underline text-xs"
      >
        {isExpanded ? 'read less' : 'read more'}
      </button>
    </div>
  );
});

// Component to display ALL memory fields with progressive loading - adapted from old code
const AdditionalMemoryFields = React.memo(({ event }: { event: TimelineEvent }) => {
  // Comprehensive fields list organized by importance for progressive loading
  const allFieldConfigs = [
    // Tier 1: Most frequently used fields (load immediately)
    { key: 'significance', label: 'Significance', icon: '⭐', color: 'text-yellow-400 bg-yellow-500/20', tier: 1 },
    { key: 'location', label: 'Location', icon: '📍', color: 'text-green-400 bg-green-500/20', tier: 1 },
    { key: 'context', label: 'Context', icon: '🔍', color: 'text-blue-400 bg-blue-500/20', tier: 1 },
    { key: 'outcome', label: 'Outcome', icon: '🎯', color: 'text-purple-400 bg-purple-500/20', tier: 1 },
    { key: 'realization', label: 'Realization', icon: '💡', color: 'text-yellow-400 bg-yellow-500/20', tier: 1 },
    { key: 'gift', label: 'Gift', icon: '🎁', color: 'text-pink-400 bg-pink-500/20', tier: 1 },
    { key: 'restaurant', label: 'Restaurant', icon: '🍽️', color: 'text-orange-400 bg-orange-500/20', tier: 1 },
    { key: 'notes', label: 'Notes', icon: '📋', color: 'text-gray-400 bg-gray-500/20', tier: 1 },
    { key: 'note', label: 'Note', icon: '📝', color: 'text-gray-400 bg-gray-500/20', tier: 1 },
    
    // Tier 2: Important fields (load with slight delay)
    { key: 'activities', label: 'Activities', icon: '🎯', color: 'text-indigo-400 bg-indigo-500/20', tier: 2 },
    { key: 'gesture', label: 'Gesture', icon: '🤝', color: 'text-blue-400 bg-blue-500/20', tier: 2 },
    { key: 'memorable_event', label: 'Memorable Event', icon: '🌟', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'milestone', label: 'Milestone', icon: '🏁', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'food', label: 'Food', icon: '🍕', color: 'text-orange-400 bg-orange-500/20', tier: 2 },
    { key: 'celebration_type', label: 'Celebration Type', icon: '🎉', color: 'text-pink-400 bg-pink-500/20', tier: 2 },
    { key: 'memorable_quote', label: 'Memorable Quote', icon: '💬', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'famous_quote', label: 'Famous Quote', icon: '💬', color: 'text-cyan-400 bg-cyan-500/20', tier: 2 },
    { key: 'saved_message', label: 'Saved Message', icon: '💌', color: 'text-pink-400 bg-pink-500/20', tier: 2 },
    { key: 'firsts', label: 'Firsts', icon: '🏆', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'first_experience', label: 'First Experience', icon: '🥇', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'emotional_impact', label: 'Emotional Impact', icon: '💥', color: 'text-red-400 bg-red-500/20', tier: 2 },
    { key: 'companions', label: 'Companions', icon: '👥', color: 'text-blue-400 bg-blue-500/20', tier: 2 },
    
    // Tier 3: All other fields (load progressively)
    { key: 'adventure', label: 'Adventure', icon: '🏔️', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'attempted_dish', label: 'Attempted Dish', icon: '👨‍🍳', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'successful_dish', label: 'Successful Dish', icon: '👨‍🍳', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'ingredients', label: 'Ingredients', icon: '🧄', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'budget_notes', label: 'Budget Notes', icon: '💰', color: 'text-yellow-400 bg-yellow-500/20', tier: 3 },
    { key: 'care', label: 'Care', icon: '💚', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'conflict', label: 'Conflict', icon: '⚔️', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'constraint', label: 'Constraint', icon: '⛓️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'discovery', label: 'Discovery', icon: '🔬', color: 'text-cyan-400 bg-cyan-500/20', tier: 3 },
    { key: 'emotional_support', label: 'Emotional Support', icon: '🤗', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'event', label: 'Event', icon: '📅', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'festival', label: 'Festival', icon: '🎊', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'flex', label: 'Flex', icon: '💫', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'food_choice', label: 'Food Choice', icon: '🍴', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'logistics', label: 'Logistics', icon: '📋', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'method', label: 'Method', icon: '⚙️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'observation', label: 'Observation', icon: '👁️', color: 'text-cyan-400 bg-cyan-500/20', tier: 3 },
    { key: 'occasion', label: 'Occasion', icon: '🎪', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'pattern', label: 'Pattern', icon: '🔄', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'strategy', label: 'Strategy', icon: '🧠', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'surprise_element', label: 'Surprise Element', icon: '🎉', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'timing', label: 'Timing', icon: '⏱️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'time', label: 'Time', icon: '🕐', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'trigger', label: 'Trigger', icon: '⚡', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'witnesses', label: 'Witnesses', icon: '👥', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'restaurants', label: 'Restaurants', icon: '🏪', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'response', label: 'Response', icon: '💬', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'role', label: 'Role', icon: '👤', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    // Add flattened nested fields
    { key: 'details_prisha_outfit', label: 'Outfit', icon: '👗', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'details_first_thoughts', label: 'First Thoughts', icon: '💭', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'details_activity', label: 'Detail Activity', icon: '🎬', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'details_aryan_had', label: 'Aryan Had', icon: '📝', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
  ];

  const [loadedTiers, setLoadedTiers] = useState<Set<number>>(new Set([1])); // Start with tier 1 loaded

  // Progressive loading of field tiers - from old code
  useEffect(() => {
    // Load tier 2 after a short delay
    const timer2 = setTimeout(() => {
      setLoadedTiers(prev => new Set([...prev, 2]));
    }, 500);

    // Load tier 3 after a longer delay
    const timer3 = setTimeout(() => {
      setLoadedTiers(prev => new Set([...prev, 3]));
    }, 1500);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Filter to show all fields with values from loaded tiers
  const fieldsToShow = allFieldConfigs.filter(config => {
    const isLoaded = loadedTiers.has(config.tier);
    const value = event[config.key];
    const hasValue = value && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    return isLoaded && hasValue;
  });

  if (fieldsToShow.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {fieldsToShow.map(config => {
        const value = event[config.key];
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        
        // Moderate truncation - still readable but manageable
        const truncatedValue = displayValue && displayValue.length > 150 
          ? displayValue.substring(0, 150) + '...' 
          : displayValue;
        
        return (
          <div key={config.key} className="flex items-start space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </span>
            <span className="text-white/70 text-xs flex-1 leading-relaxed">
              {truncatedValue}
            </span>
          </div>
        );
      })}
      
      {/* Show loading indicator for fields still loading */}
      {!loadedTiers.has(3) && (
        <div className="text-xs text-gray-500 mt-2 flex items-center">
          <Loader className="animate-spin h-3 w-3 mr-1" />
          Loading additional fields...
        </div>
      )}
    </div>
  );
});

function Timeline() {
  // Fixed state management - using displayedEvents to prevent duplicates
  const [displayedEvents, setDisplayedEvents] = useState<TimelineEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useNotification();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    emotions: [] as string[],
    isHighlight: false
  });

  // Mobile state - better detection from old code
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Image zoom modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageData, setModalImageData] = useState('');
  const [modalImageTitle, setModalImageTitle] = useState('');

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);

  // Intersection observer for infinite scroll - improved from old code
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Better mobile detection from old code
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter events based on search and category
  useEffect(() => {
    let filtered = displayedEvents;
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.emotions?.some(emotion => emotion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    setFilteredEvents(filtered);
  }, [displayedEvents, searchTerm, selectedCategory]);

  // Load timeline events
  useEffect(() => {
    loadInitialEvents();
  }, []);

  const loadInitialEvents = async () => {
    try {
      setIsInitialLoading(true);
      console.log('Loading initial timeline events...');
      const result = await dataService.getTimelineEventsPage(0);
      console.log('Loaded events:', result.events.length);
      setDisplayedEvents(result.events);
      setHasMorePages(result.hasMore);
      setCurrentPage(0);
      setError(null);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load timeline');
      showError('Error', 'Failed to load timeline events');
    } finally {
      setIsInitialLoading(false);
    }
  };
  
  // Fixed pagination logic - prevents duplicates
  const loadMoreEvents = useCallback(async () => {
    if (isLoadingMore || !hasMorePages) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage}...`);
      
      const result = await dataService.getTimelineEventsPage(nextPage);
      console.log(`Loaded ${result.events.length} more events`);
      
      // Append new events without duplicates
      setDisplayedEvents(prev => [...prev, ...result.events]);
      setHasMorePages(result.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more events:', error);
      showError('Error', 'Failed to load more memories');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMorePages, isLoadingMore, showError]);

  // Better intersection observer from old code with debouncing - MOVED AFTER loadMoreEvents
  useEffect(() => {
    if (!sentinelRef.current || !hasMorePages || isLoadingMore || isMobile) return;

    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Debounce to prevent rapid calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadMoreEvents();
          }, 500);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [hasMorePages, isLoadingMore, isMobile, loadMoreEvents]);

  // Modal handlers
  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: '',
      emotions: [],
      isHighlight: false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title required', 'Please enter a title for your memory.');
      return;
    }

    try {
      const newEvent = await dataService.addTimelineEvent({
        ...formData,
        image: '' // We'll add image support later
      });
      setDisplayedEvents(prev => [newEvent, ...prev]);
      showSuccess('Memory added!', 'Your new memory has been added to the timeline.');
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Save failed', 'Could not save your memory. Please try again.');
    }
  };

  // Edit functionality
  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      category: event.category || '',
      emotions: event.emotions || [],
      isHighlight: event.isHighlight || false
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
  };

  const handleEditSave = async () => {
    if (!editingEvent || !formData.title.trim()) {
      showError('Title required', 'Please enter a title for your memory.');
      return;
    }

    try {
      const updatedEvent = await dataService.updateTimelineEvent(editingEvent.id, formData);
      setDisplayedEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      showSuccess('Memory updated!', 'Your memory has been updated successfully.');
      closeEditModal();
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Update failed', 'Could not update your memory. Please try again.');
    }
  };

  // Image modal handlers
  const openImageModal = (imageData: string, title: string) => {
    setModalImageData(imageData);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageData('');
    setModalImageTitle('');
  };

  // Keyboard handlers
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showImageModal) closeImageModal();
        else if (showEditModal) closeEditModal();
        else if (showModal) closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal, showEditModal, showImageModal]);

  // Timeline navigation with arrow keys
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (showModal || showEditModal || showImageModal) return;
      
      const currentEvents = searchTerm || selectedCategory ? filteredEvents : displayedEvents;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex(prev => Math.max(0, prev - 1));
        scrollToEvent(Math.max(0, activeIndex - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex(prev => Math.min(currentEvents.length - 1, prev + 1));
        scrollToEvent(Math.min(currentEvents.length - 1, activeIndex + 1));
      } else if (e.key === 'Enter' && currentEvents[activeIndex]) {
        e.preventDefault();
        openEditModal(currentEvents[activeIndex]);
      } else if (e.key === '/' && !showModal && !showEditModal && !showImageModal) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search memories..."]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [showModal, showEditModal, showImageModal, displayedEvents, filteredEvents, searchTerm, selectedCategory, activeIndex]);

  // Scroll to active event
  const scrollToEvent = (index: number) => {
    const element = document.querySelector(`[data-event-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Timeline</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={loadInitialEvents}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 rounded-full px-6 py-2 border border-white/10 mb-6">
              <Heart className="text-pink-400 mr-2" size={18} />
              <span className="text-base font-medium">Aryan & Prisha's Journey</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Timeline of Love
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto mb-8">
              A beautiful chronological journey through our cherished memories.
            </p>
            
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              Add Memory
            </button>
            
            {/* Memory Statistics */}
            {displayedEvents.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                  <span className="text-purple-300">Total Memories:</span>
                  <span className="text-white font-semibold ml-2">{displayedEvents.length}</span>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                  <span className="text-yellow-300">Special Highlights:</span>
                  <span className="text-white font-semibold ml-2">
                    {displayedEvents.filter(e => e.isHighlight).length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search and Filter Bar */}
          {displayedEvents.length > 0 && (
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search memories... (Press / to focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors text-white"
                >
                  <option value="">All Categories</option>
                  <option value="milestone">Milestone</option>
                  <option value="celebration">Celebration</option>
                  <option value="date">Date</option>
                  <option value="travel">Travel</option>
                  <option value="romantic_gesture">Romantic Gesture</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="gift">Gift</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="px-4 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Keyboard Navigation Hint */}
          {displayedEvents.length > 0 && !isMobile && (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10 text-xs text-gray-400">
                <span>💡 Use arrow keys to navigate • Enter to edit • / to search</span>
              </div>
            </div>
          )}

          {/* Content */}
          {displayedEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/5 rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                <Calendar size={64} className="mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold mb-4">No Memories Yet</h3>
                <p className="text-gray-300 mb-6">Start your timeline by adding the first memory!</p>
                <button 
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  <Plus size={20} className="mr-2 inline" />
                  Add First Memory
                </button>
              </div>
            </div>
          ) : (
            <div className={`${isMobile ? 'overflow-x-auto' : 'space-y-8'}`}>
              {(searchTerm || selectedCategory) && filteredEvents.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/5 rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                    <Calendar size={64} className="mx-auto mb-6 text-gray-400" />
                    <h3 className="text-2xl font-bold mb-4">No Matching Memories</h3>
                    <p className="text-gray-300 mb-6">
                      No memories found matching your search criteria. Try adjusting your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isMobile ? (
                    <div className="flex space-x-6 pb-4" style={{ width: `${(searchTerm || selectedCategory ? filteredEvents : displayedEvents).length * 300}px` }}>
                      {(searchTerm || selectedCategory ? filteredEvents : displayedEvents).map((event, index) => (
                        <motion.div 
                          key={event.id} 
                          data-event-index={index}
                          className="flex-shrink-0 w-80"
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <div className={`rounded-xl p-6 border transition-all duration-300 shadow-lg relative ${
                            event.isHighlight 
                              ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30' 
                              : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/20'
                          }`}>
                            {event.isHighlight && (
                              <div className="absolute top-4 right-4">
                                <span className="text-yellow-400 text-xs font-medium">✨ Special Memory</span>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              {event.category && (
                                <div className="text-blue-300 text-xs uppercase tracking-wide">
                                  {event.category.replace('_', ' ')}
                                </div>
                              )}
                              
                              <div className="text-purple-300 text-sm">
                                {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 'Date unknown'}
                              </div>
                              
                              <h3 className="text-xl font-bold text-white leading-tight">
                                {event.title}
                              </h3>
                              
                              {event.emotions && event.emotions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {event.emotions.slice(0, 3).map((emotion, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                      {emotion}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="mb-4">
                                <ExpandableText text={event.description} maxLength={150} />
                              </div>
                              
                              <TimelineImage 
                                event={event} 
                                className="w-full h-32 object-cover rounded-lg" 
                                onImageClick={openImageModal} 
                              />
                              
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => openEditModal(event)}
                                  className="inline-flex items-center px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xs"
                                >
                                  <Edit size={14} className="mr-1" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    (searchTerm || selectedCategory ? filteredEvents : displayedEvents).map((event, index) => (
                      <motion.div 
                        key={event.id} 
                        data-event-index={index}
                        className="flex items-start space-x-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-4 shadow-lg transition-all duration-300 ${
                            index === activeIndex 
                              ? 'border-white scale-125 ring-4 ring-purple-400/50' 
                              : 'border-white'
                          } ${
                            event.isHighlight 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`} />
                          {index < (searchTerm || selectedCategory ? filteredEvents : displayedEvents).length - 1 && (
                            <div className="w-0.5 h-24 bg-gradient-to-b from-purple-500 to-pink-500 mt-2" />
                          )}
                        </div>

                        {/* Event content */}
                        <div className="flex-1 pb-6">
                          <div className={`rounded-xl border transition-all duration-300 shadow-lg relative hover:scale-105 overflow-hidden ${
                            index === activeIndex 
                              ? 'ring-2 ring-purple-400/50 scale-105' 
                              : ''
                          } ${
                            event.isHighlight 
                              ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30' 
                              : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/20'
                          }`}>
                            {event.isHighlight && (
                              <div className="absolute top-4 left-4 z-10">
                                <span className="text-yellow-400 text-xs font-medium flex items-center">
                                  <Sparkles size={16} className="mr-1" />
                                  Special Memory
                                </span>
                              </div>
                            )}
                            
                            {/* Desktop layout: content on left, image on right */}
                            <div className="flex flex-col lg:flex-row">
                              {/* Left side - Content */}
                              <div className="flex-1 p-6 space-y-3">
                                {event.category && (
                                  <div className="text-blue-300 text-xs uppercase tracking-wide">
                                    {event.category.replace('_', ' ')}
                                  </div>
                                )}
                                
                                <div className="text-purple-300 text-sm">
                                  {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) : 'Date unknown'}
                                </div>
                                
                                <h3 className="text-xl font-bold text-white leading-tight">
                                  {event.title}
                                </h3>
                                
                                {event.emotions && event.emotions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {event.emotions.map((emotion, i) => (
                                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                        {emotion}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="mb-3">
                                  <ExpandableText text={event.description} maxLength={200} />
                                </div>
                                
                                <AdditionalMemoryFields event={event} />
                                
                                <div className="flex justify-end pt-3">
                                  <button
                                    onClick={() => openEditModal(event)}
                                    className="inline-flex items-center px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Memory
                                  </button>
                                </div>
                              </div>
                              
                              {/* Right side - Image */}
                              <div className="lg:w-80 mt-4 lg:mt-0 flex-shrink-0">
                                <TimelineImage 
                                  event={event} 
                                  className="w-full h-64 object-cover rounded-lg shadow-xl border border-purple-500/30" 
                                  onImageClick={openImageModal} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  
                  {/* Load More Section */}
                  {hasMorePages && (
                    <div ref={sentinelRef} className="text-center py-8">
                      <button
                        onClick={loadMoreEvents}
                        disabled={isLoadingMore}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Loading more memories...</span>
                          </div>
                        ) : (
                          <>
                            <span>Load More Memories</span>
                            <div className="text-xs text-white/60 mt-1">or scroll to auto-load</div>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {!hasMorePages && (searchTerm || selectedCategory ? filteredEvents : displayedEvents).length > 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-sm">
                        ✨ You've explored all your beautiful memories ✨
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Memory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Memory</h3>
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
                  placeholder="Enter a title"
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
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="milestone">Milestone</option>
                  <option value="celebration">Celebration</option>
                  <option value="date">Date</option>
                  <option value="travel">Travel</option>
                  <option value="romantic_gesture">Romantic Gesture</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="gift">Gift</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors h-32 resize-none"
                  placeholder="Describe this memory..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emotions (comma-separated)</label>
                <input
                  type="text"
                  value={formData.emotions.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emotions: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                  placeholder="happy, excited, nostalgic..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.isHighlight}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHighlight: e.target.checked }))}
                  className="mr-3 w-4 h-4"
                />
                <label htmlFor="highlight" className="text-sm font-medium">
                  ✨ Special highlight
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
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Memory</h3>
              <button
                onClick={closeEditModal}
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
                  placeholder="Enter a title"
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
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="milestone">Milestone</option>
                  <option value="celebration">Celebration</option>
                  <option value="date">Date</option>
                  <option value="travel">Travel</option>
                  <option value="romantic_gesture">Romantic Gesture</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="gift">Gift</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors h-32 resize-none"
                  placeholder="Describe this memory..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emotions (comma-separated)</label>
                <input
                  type="text"
                  value={formData.emotions.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emotions: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                  placeholder="happy, excited, nostalgic..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.isHighlight}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHighlight: e.target.checked }))}
                  className="mr-3 w-4 h-4"
                />
                <label htmlFor="highlight" className="text-sm font-medium">
                  ✨ Special highlight
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{modalImageTitle}</h3>
              <button
                onClick={closeImageModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <img
                src={modalImageData.startsWith('data:image') ? modalImageData : `data:image/jpeg;base64,${modalImageData}`}
                alt={modalImageTitle}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
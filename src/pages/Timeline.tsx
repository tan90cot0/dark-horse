import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, ChevronRight, ChevronLeft, Save, X, Image as ImageIcon, Heart, Sparkles, Loader } from 'lucide-react';
import dataService, { TimelineEvent } from '../utils/dataService';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Ultra-minimal Image Component - Memoized for performance
const MinimalTimelineImage = React.memo(({ 
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

  // Balanced intersection observer - not too aggressive
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' } // Balanced loading
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

// Component to display ALL memory fields with progressive loading - No data hidden!
const AdditionalMemoryFields = React.memo(({ event }: { event: TimelineEvent }) => {
  // ALL 69 fields - organized by importance for progressive loading
  const allFieldConfigs = [
    // Tier 1: Most frequently used fields (load immediately)
    { key: 'significance', label: 'Significance', icon: '⭐', color: 'text-yellow-400 bg-yellow-500/20', tier: 1 },
    { key: 'location', label: 'Location', icon: '📍', color: 'text-green-400 bg-green-500/20', tier: 1 },
    { key: 'context', label: 'Context', icon: '🔍', color: 'text-blue-400 bg-blue-500/20', tier: 1 },
    { key: 'outcome', label: 'Outcome', icon: '🎯', color: 'text-purple-400 bg-purple-500/20', tier: 1 },
    { key: 'realization', label: 'Realization', icon: '💡', color: 'text-yellow-400 bg-yellow-500/20', tier: 1 },
    { key: 'gifts', label: 'Gifts', icon: '🎁', color: 'text-pink-400 bg-pink-500/20', tier: 1 },
    { key: 'gift', label: 'Gift', icon: '🎁', color: 'text-pink-400 bg-pink-500/20', tier: 1 },
    { key: 'restaurant', label: 'Restaurant', icon: '🍽️', color: 'text-orange-400 bg-orange-500/20', tier: 1 },
    { key: 'notes', label: 'Notes', icon: '📋', color: 'text-gray-400 bg-gray-500/20', tier: 1 },
    { key: 'note', label: 'Note', icon: '📝', color: 'text-gray-400 bg-gray-500/20', tier: 1 },
    
    // Tier 2: Important fields (load with slight delay)
    { key: 'activities', label: 'Activities', icon: '🎯', color: 'text-indigo-400 bg-indigo-500/20', tier: 2 },
    { key: 'gesture', label: 'Gesture', icon: '🤝', color: 'text-blue-400 bg-blue-500/20', tier: 2 },
    { key: 'details', label: 'Details', icon: '📄', color: 'text-gray-400 bg-gray-500/20', tier: 2 },
    { key: 'memorable_event', label: 'Memorable Event', icon: '🌟', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'milestone', label: 'Milestone', icon: '🏁', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'emotional_detail', label: 'Emotional Detail', icon: '💭', color: 'text-purple-400 bg-purple-500/20', tier: 2 },
    { key: 'favorite_moment', label: 'Favorite Moment', icon: '⭐', color: 'text-yellow-400 bg-yellow-500/20', tier: 2 },
    { key: 'food', label: 'Food', icon: '🍕', color: 'text-orange-400 bg-orange-500/20', tier: 2 },
    { key: 'locations', label: 'Locations', icon: '🗺️', color: 'text-green-400 bg-green-500/20', tier: 2 },
    { key: 'celebration_type', label: 'Celebration Type', icon: '🎉', color: 'text-pink-400 bg-pink-500/20', tier: 2 },
    
    // Tier 3: All other fields (load progressively)
    { key: 'adventure', label: 'Adventure', icon: '🏔️', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'attempted_dish', label: 'Attempted Dish', icon: '👨‍🍳', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'benefit', label: 'Benefit', icon: '✅', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'budget_notes', label: 'Budget Notes', icon: '💰', color: 'text-yellow-400 bg-yellow-500/20', tier: 3 },
    { key: 'care', label: 'Care', icon: '💚', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'care_actions', label: 'Care Actions', icon: '🤝', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'comfort_items', label: 'Comfort Items', icon: '🛋️', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'companions', label: 'Companions', icon: '👥', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'conflict', label: 'Conflict', icon: '⚔️', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'constraint', label: 'Constraint', icon: '⛓️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'devotion', label: 'Devotion', icon: '💝', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'discovery', label: 'Discovery', icon: '🔬', color: 'text-cyan-400 bg-cyan-500/20', tier: 3 },
    { key: 'doctor_quote', label: 'Doctor Quote', icon: '👨‍⚕️', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'eating_pattern', label: 'Eating Pattern', icon: '🍽️', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'effort', label: 'Effort', icon: '💪', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'emotional_impact', label: 'Emotional Impact', icon: '💥', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'emotional_support', label: 'Emotional Support', icon: '🤗', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'event', label: 'Event', icon: '📅', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'famous_quote', label: 'Famous Quote', icon: '💬', color: 'text-yellow-400 bg-yellow-500/20', tier: 3 },
    { key: 'festival', label: 'Festival', icon: '🎊', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'first_experience', label: 'First Experience', icon: '🥇', color: 'text-gold-400 bg-yellow-500/20', tier: 3 },
    { key: 'firsts', label: 'Firsts', icon: '🏆', color: 'text-gold-400 bg-yellow-500/20', tier: 3 },
    { key: 'flex', label: 'Flex', icon: '💫', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'food_choice', label: 'Food Choice', icon: '🍴', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'incident', label: 'Incident', icon: '⚠️', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'ingredients', label: 'Ingredients', icon: '🧄', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'initial_feeling', label: 'Initial Feeling', icon: '💫', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'logistics', label: 'Logistics', icon: '📋', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'medical_concern', label: 'Medical Concern', icon: '🏥', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'medical_details', label: 'Medical Details', icon: '👨‍⚕️', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'memorable_incident', label: 'Memorable Incident', icon: '💭', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'memorable_items', label: 'Memorable Items', icon: '🏺', color: 'text-brown-400 bg-amber-500/20', tier: 3 },
    { key: 'memorable_quote', label: 'Memorable Quote', icon: '💬', color: 'text-yellow-400 bg-yellow-500/20', tier: 3 },
    { key: 'method', label: 'Method', icon: '⚙️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'observation', label: 'Observation', icon: '👁️', color: 'text-cyan-400 bg-cyan-500/20', tier: 3 },
    { key: 'occasion', label: 'Occasion', icon: '🎪', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'order', label: 'Order', icon: '📋', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'organization', label: 'Organization', icon: '🏢', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'outlet', label: 'Outlet', icon: '🚪', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'pattern', label: 'Pattern', icon: '🔄', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'promise', label: 'Promise', icon: '🤝', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'regret', label: 'Regret', icon: '😔', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'response', label: 'Response', icon: '💬', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'restaurants', label: 'Restaurants', icon: '🏪', color: 'text-orange-400 bg-orange-500/20', tier: 3 },
    { key: 'role', label: 'Role', icon: '👤', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'saved_message', label: 'Saved Message', icon: '💌', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'separation_duration', label: 'Separation Duration', icon: '⏰', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'song', label: 'Song', icon: '🎵', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'song_type', label: 'Song Type', icon: '🎶', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'special_quotes', label: 'Special Quotes', icon: '💭', color: 'text-yellow-400 bg-yellow-500/20', tier: 3 },
    { key: 'strategy', label: 'Strategy', icon: '🧠', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'successful_dish', label: 'Successful Dish', icon: '👨‍🍳', color: 'text-green-400 bg-green-500/20', tier: 3 },
    { key: 'surprise_element', label: 'Surprise Element', icon: '🎉', color: 'text-pink-400 bg-pink-500/20', tier: 3 },
    { key: 'telegram_detail', label: 'Telegram Detail', icon: '📱', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
    { key: 'time', label: 'Time', icon: '🕐', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'timing', label: 'Timing', icon: '⏱️', color: 'text-gray-400 bg-gray-500/20', tier: 3 },
    { key: 'trigger', label: 'Trigger', icon: '⚡', color: 'text-red-400 bg-red-500/20', tier: 3 },
    { key: 'unique_elements', label: 'Unique Elements', icon: '✨', color: 'text-purple-400 bg-purple-500/20', tier: 3 },
    { key: 'witnesses', label: 'Witnesses', icon: '👥', color: 'text-blue-400 bg-blue-500/20', tier: 3 },
  ];

  const [loadedTiers, setLoadedTiers] = useState<Set<number>>(new Set([1])); // Start with tier 1 loaded

  // Progressive loading of field tiers
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
  const [displayedEvents, setDisplayedEvents] = useState<TimelineEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalMemories, setTotalMemories] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [renderingError, setRenderingError] = useState<string | null>(null);
  
  // Mobile state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: '',
    isHighlight: false,
    category: '',
    emotions: [] as string[]
  });

  // Image zoom modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageData, setModalImageData] = useState('');
  const [modalImageTitle, setModalImageTitle] = useState('');
  
  // Edit functionality state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError, showInfo } = useNotification();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load initial page only (reduce from 3 to 2 items for better performance)
  useEffect(() => {
    loadInitialPage();
  }, []);

  const loadInitialPage = async () => {
    setIsInitialLoading(true);
    try {
      console.log('Loading initial page (2 items for performance)...');
      const result = await dataService.getTimelineEventsPage(0);
      
      setDisplayedEvents(result.events);
      setHasMorePages(result.hasMore);
      setTotalMemories(result.total);
      setCurrentPage(0);
      setError(null);
      
      if (result.events.length === 0) {
        showInfo('Timeline is empty', 'Start adding your memories!');
      }
    } catch (error) {
      console.error('Error loading initial page:', error);
      setError('Failed to load timeline. Please try again.');
      showError('Failed to load timeline', 'Please check your connection and try again.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMorePages) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage}...`);
      
      const result = await dataService.getTimelineEventsPage(nextPage);
      
      setDisplayedEvents(prev => [...prev, ...result.events]);
      setHasMorePages(result.hasMore);
      setCurrentPage(nextPage);
      
      console.log(`Loaded page ${nextPage}: ${result.events.length} new items`);
    } catch (error) {
      console.error('Error loading next page:', error);
      showError('Failed to load more', 'Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMorePages, isLoadingMore, showError]);

  // Intersection observer for desktop infinite scroll with debouncing
  useEffect(() => {
    if (!sentinelRef.current || !hasMorePages || isLoadingMore || isMobile) return;

    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Debounce the loading to prevent rapid calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadNextPage();
          }, 500); // 500ms delay for better UX
        }
      },
      { threshold: 0.1, rootMargin: '200px' } // Increased rootMargin for better UX
    );

    observer.observe(sentinelRef.current);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [hasMorePages, isLoadingMore, isMobile, loadNextPage]);

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date unknown';
    
    try {
      if (dateString.includes('-')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Mobile navigation
  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };
  
  const handleNext = () => {
    // Load more if we're near the end
    if (activeIndex >= displayedEvents.length - 2 && hasMorePages && !isLoadingMore) {
      loadNextPage();
    }
    
    if (activeIndex < displayedEvents.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      isHighlight: false,
      category: '',
      emotions: []
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleImageClick = (imageData: string, title: string) => {
    setModalImageData(imageData);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageData('');
    setModalImageTitle('');
  };

  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      image: event.image,
      isHighlight: event.isHighlight || false,
      category: event.category || '',
      emotions: event.emotions || []
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      image: '',
      isHighlight: false,
      category: '',
      emotions: []
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
        const updatedEvent = { ...editingEvent, ...formData };
        setDisplayedEvents(prev => 
          prev.map(event => event.id === editingEvent.id ? updatedEvent : event)
            .sort((a, b) => {
              if (!a.date && !b.date) return 0;
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
        );
        showSuccess('Memory updated!', 'Your memory has been updated.');
        closeEditModal();
      } else {
        // Add new event
        const newEvent = await dataService.addTimelineEvent(formData);
        setDisplayedEvents(prev => [newEvent, ...prev]);
        showSuccess('Memory added!', 'Your new memory has been added.');
        closeModal();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Save failed', 'Could not save your memory. Please try again.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Escape key handling
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showImageModal) {
          closeImageModal();
        } else if (showModal) {
          closeModal();
        } else if (showEditModal) {
          closeEditModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showImageModal, showModal, showEditModal]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setRenderingError('An unexpected error occurred. Please refresh the page.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setRenderingError('A loading error occurred. Please try again.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear data service cache when component unmounts
      dataService.clearCache();
    };
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner message="Loading first memories..." />
      </div>
    );
  }

  if (error || renderingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8 glass-effect rounded-lg border border-white/10 max-w-md">
          <X className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Timeline</h2>
          <p className="text-gray-300 mb-4">{error || renderingError}</p>
          <button 
            onClick={() => {
              setError(null);
              setRenderingError(null);
              window.location.reload();
            }}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center glass-effect rounded-full px-6 py-2 border border-white/10 mb-6"
            >
              <Heart className="text-pink-400 mr-2" size={18} />
              <span className="text-base font-medium">Aryan & Prisha's Journey</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4 gradient-text">Timeline of Love</h1>
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
          </div>
          
          {/* Content */}
          {(() => {
            try {
              if (displayedEvents.length === 0) {
                return (
                  <div className="text-center py-20">
                    <div className="glass-effect rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                      <Calendar size={64} className="mx-auto mb-6 text-purple-400" />
                      <h3 className="text-2xl font-bold mb-4">No Memories Yet</h3>
                      <p className="text-gray-300 mb-6">Start your timeline by adding the first memory!</p>
                      <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                      >
                        Add First Memory
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* Mobile Carousel */}
                  {isMobile ? (
                    <div className="sm:hidden">
                      <div className="flex justify-center mb-6">
                        <div className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                          {activeIndex + 1} of {displayedEvents.length}
                          {hasMorePages && ' (loading more...)'}
                        </div>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {displayedEvents[activeIndex] && (
                          <motion.div
                            key={displayedEvents[activeIndex].id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`px-6 py-8 rounded-xl border min-h-[500px] relative ${
                              displayedEvents[activeIndex].isHighlight 
                                ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30' 
                                : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/20'
                            }`}
                          >
                            {/* Mobile content rendering */}
                            {displayedEvents[activeIndex].isHighlight && (
                              <div className="absolute top-4 right-4 flex items-center space-x-2">
                                <span className="text-yellow-400 text-xs font-medium">Special Memory</span>
                                <Sparkles className="text-yellow-400" size={24} />
                              </div>
                            )}

                            {/* Edit button */}
                            <button
                              onClick={() => openEditModal(displayedEvents[activeIndex])}
                              className="absolute bottom-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm"
                              title="Edit memory"
                            >
                              <span className="text-white text-xs">✏️</span>
                            </button>
                            
                            <div className="flex flex-col space-y-6">
                              <div className="text-center">
                                {displayedEvents[activeIndex].category && (
                                  <div className="text-blue-300 mb-1 text-xs uppercase tracking-wide">
                                    {displayedEvents[activeIndex].category.replace('_', ' ')}
                                  </div>
                                )}
                                <div className="text-purple-300 mb-1 text-sm">
                                  {formatDate(displayedEvents[activeIndex].date)}
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight mb-4">
                                  {displayedEvents[activeIndex].title}
                                </h3>
                                {displayedEvents[activeIndex].emotions && displayedEvents[activeIndex].emotions!.length > 0 && (
                                  <div className="flex justify-center flex-wrap gap-2 mb-4">
                                    {displayedEvents[activeIndex].emotions!.map((emotion, i) => (
                                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                        {emotion}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="max-h-32 overflow-y-auto">
                                  <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                                    {displayedEvents[activeIndex].description.length > 200 
                                      ? displayedEvents[activeIndex].description.substring(0, 200) + '...'
                                      : displayedEvents[activeIndex].description
                                    }
                                  </p>
                                </div>
                                
                                {/* Additional memory fields */}
                                <AdditionalMemoryFields event={displayedEvents[activeIndex]} />
                              </div>
                              
                              <div className="flex justify-center">
                                <MinimalTimelineImage
                                  event={displayedEvents[activeIndex]}
                                  className="w-64 h-64 object-cover rounded-lg shadow-xl border border-purple-500/30"
                                  onImageClick={handleImageClick}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-center mt-6 space-x-3">
                        <button
                          onClick={handlePrev}
                          disabled={activeIndex === 0}
                          className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={handleNext}
                          disabled={activeIndex >= displayedEvents.length - 1 && !hasMorePages}
                          className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {hasMorePages && (
                          <button
                            onClick={loadNextPage}
                            disabled={isLoadingMore}
                            className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 text-sm"
                          >
                            {isLoadingMore ? <Loader className="animate-spin h-4 w-4" /> : 'Load More'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Desktop Timeline */
                    <div className="hidden sm:block">
                      <div className="flex flex-col space-y-8">
                        {displayedEvents.map((event, index) => {
                          try {
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start space-x-8 group"
                              >
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg ${
                                    event.isHighlight 
                                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  }`} />
                                  {index < displayedEvents.length - 1 && (
                                    <div className="w-0.5 h-24 bg-gradient-to-b from-purple-500 to-pink-500 mt-2" />
                                  )}
                                </div>

                                {/* Event content */}
                                <div className="flex-1 pb-8">
                                  <div className={`rounded-xl p-6 border hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-xl relative ${
                                    event.isHighlight 
                                      ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30' 
                                      : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/20'
                                  }`}>
                                    {event.isHighlight && (
                                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                                        <span className="text-yellow-400 text-xs font-medium">Special Memory</span>
                                        <Sparkles className="text-yellow-400" size={20} />
                                      </div>
                                    )}

                                    {/* Edit button */}
                                    <button
                                      onClick={() => openEditModal(event)}
                                      className="absolute bottom-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm"
                                      title="Edit memory"
                                    >
                                      <span className="text-white text-xs">✏️</span>
                                    </button>
                                    
                                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                                      <div className="flex-1">
                                        {event.category && (
                                          <div className="text-blue-300 mb-1 text-xs uppercase tracking-wide">
                                            {event.category.replace('_', ' ')}
                                          </div>
                                        )}
                                        <div className="text-purple-300 mb-2 text-sm">
                                          {formatDate(event.date)}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                                          {event.title}
                                        </h3>
                                        {event.emotions && event.emotions.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mb-4">
                                            {event.emotions.map((emotion, i) => (
                                              <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                                {emotion}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="max-h-48 overflow-y-auto pr-2">
                                          <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                                            {event.description}
                                          </p>
                                        </div>
                                        
                                        {/* Additional memory fields */}
                                        <AdditionalMemoryFields event={event} />
                                      </div>
                                      
                                      <div className="lg:w-80 mt-4 lg:mt-0 flex-shrink-0">
                                        <MinimalTimelineImage
                                          event={event}
                                          className="w-full h-64 object-cover rounded-lg shadow-xl border border-purple-500/30"
                                          onImageClick={handleImageClick}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          } catch (error) {
                            console.error('Error rendering event:', event.id, error);
                            return (
                              <div key={event.id} className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-sm">Error displaying memory: {event.title}</p>
                              </div>
                            );
                          }
                        })}
                        
                        {/* Load more section */}
                        {hasMorePages && (
                          <div ref={sentinelRef} className="flex justify-center py-8">
                            {isLoadingMore ? (
                              <div className="flex items-center space-x-2 text-purple-400">
                                <Loader className="animate-spin h-5 w-5" />
                                <span>Loading more memories...</span>
                              </div>
                            ) : (
                              <button
                                onClick={loadNextPage}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                              >
                                Load More Memories
                              </button>
                            )}
                          </div>
                        )}
                        
                        {!hasMorePages && displayedEvents.length > 0 && (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-sm">
                              ✨ You've explored all your beautiful memories ✨
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            } catch (error) {
              console.error('Error rendering timeline content:', error);
              setRenderingError('Error rendering timeline content. Please refresh.');
              return (
                <div className="text-center py-20">
                  <div className="text-red-400 text-lg mb-4">Error displaying timeline</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Refresh Page
                  </button>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Add/Edit Memory Modal */}
      {(showModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingEvent ? 'Edit Memory' : 'Add New Memory'}</h3>
              <button
                onClick={editingEvent ? closeEditModal : closeModal}
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
                  <option value="crisis">Crisis</option>
                  <option value="reconciliation">Reconciliation</option>
                  <option value="family">Family</option>
                  <option value="achievement">Achievement</option>
                  <option value="surprise">Surprise</option>
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

              <div>
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.isHighlight}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHighlight: e.target.checked }))}
                  className="mr-3 w-4 h-4"
                />
                <label htmlFor="highlight" className="text-sm font-medium flex items-center">
                  <Sparkles size={16} className="mr-1 text-yellow-400" />
                  Special highlight
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingEvent ? closeEditModal : closeModal}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center"
              >
                <Save size={16} className="mr-2" />
                {editingEvent ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={closeImageModal}
          >
            <div className="relative">
              <img 
                src={modalImageData}
                alt={modalImageTitle}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
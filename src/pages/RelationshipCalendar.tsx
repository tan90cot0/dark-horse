import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Plane, Film, Gift, MapPin, Clock, Plus, Edit2, Trash2 } from 'lucide-react';

interface RelationshipEvent {
  id: string;
  title: string;
  date: string;
  type: 'movie' | 'flight' | 'meeting' | 'anniversary' | 'gift' | 'other';
  description?: string;
  location?: string;
  isCountdown?: boolean;
}

function RelationshipCalendar() {
  const [events, setEvents] = useState<RelationshipEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RelationshipEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<RelationshipEvent>>({
    title: '',
    date: '',
    type: 'other',
    description: '',
    location: '',
    isCountdown: false
  });

  const eventTypes = [
    { name: 'movie', label: 'Movie Date', icon: Film, color: 'from-red-500 to-pink-500' },
    { name: 'flight', label: 'Flight', icon: Plane, color: 'from-blue-500 to-cyan-500' },
    { name: 'meeting', label: 'Meeting', icon: MapPin, color: 'from-green-500 to-emerald-500' },
    { name: 'anniversary', label: 'Anniversary', icon: Heart, color: 'from-purple-500 to-pink-500' },
    { name: 'gift', label: 'Gift', icon: Gift, color: 'from-yellow-500 to-orange-500' },
    { name: 'other', label: 'Other', icon: Calendar, color: 'from-gray-500 to-slate-500' }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('relationshipEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Add some sample events
      const sampleEvents: RelationshipEvent[] = [
        {
          id: '1',
          title: 'First Date Anniversary',
          date: '2024-02-14',
          type: 'anniversary',
          description: 'Our very first date! 💕',
          isCountdown: false
        },
        {
          id: '2',
          title: 'Next Visit',
          date: '2024-04-15',
          type: 'meeting',
          description: 'Finally meeting again!',
          location: 'Her city',
          isCountdown: true
        }
      ];
      setEvents(sampleEvents);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('relationshipEvents', JSON.stringify(events));
    }
  }, [events]);

  const getDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    const event: RelationshipEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type as RelationshipEvent['type'],
      description: newEvent.description || '',
      location: newEvent.location || '',
      isCountdown: newEvent.isCountdown || false
    };
    
    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: '',
      date: '',
      type: 'other',
      description: '',
      location: '',
      isCountdown: false
    });
    setShowAddForm(false);
  };

  const handleEditEvent = (event: RelationshipEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowAddForm(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title || !newEvent.date) return;
    
    const updatedEvent: RelationshipEvent = {
      ...editingEvent,
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type as RelationshipEvent['type'],
      description: newEvent.description || '',
      location: newEvent.location || '',
      isCountdown: newEvent.isCountdown || false
    };
    
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? updatedEvent : e));
    setEditingEvent(null);
    setNewEvent({
      title: '',
      date: '',
      type: 'other',
      description: '',
      location: '',
      isCountdown: false
    });
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const upcomingEvents = events
    .filter(event => getDaysUntil(event.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const countdownEvents = events.filter(event => event.isCountdown && getDaysUntil(event.date) >= 0);

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.name === type) || eventTypes[eventTypes.length - 1];
  };

  const generateCalendarGrid = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return { days, monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  };

  const getEventsForDate = (day: number) => {
    if (!day) return [];
    const today = new Date();
    const dateString = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const { days, monthName } = generateCalendarGrid();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center glass-effect rounded-full px-6 py-2 border border-white/10 mb-4"
            >
              <Heart className="text-pink-400 mr-2" size={18} />
              <span className="text-base font-medium">Our Journey</span>
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Relationship Calendar</h1>
            <p className="text-gray-400">Tracking our special moments and future adventures 💕</p>
          </div>

          {/* Countdown Cards */}
          {countdownEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 text-purple-400" size={24} />
                Counting Down To...
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countdownEvents.map(event => {
                  const daysLeft = getDaysUntil(event.date);
                  const eventType = getEventTypeInfo(event.type);
                  const Icon = eventType.icon;
                  
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className={`glass-effect border border-white/10 rounded-2xl p-6 bg-gradient-to-r ${eventType.color}/10`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="text-white" size={24} />
                        <span className="text-sm text-gray-300">{event.type}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                          {daysLeft}
                        </div>
                        <div className="text-sm text-gray-300">
                          {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'day left' : 'days left'}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-4">{event.description}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">{monthName}</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-sm font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => {
                    const dayEvents = day ? getEventsForDate(day) : [];
                    const isToday = day === new Date().getDate();
                    
                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[60px] p-2 rounded-lg border transition-all duration-200
                          ${day ? 'hover:bg-white/10 border-white/10' : 'border-transparent'}
                          ${isToday ? 'ring-2 ring-blue-400 bg-blue-500/10' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : ''}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.map(event => {
                                const eventType = getEventTypeInfo(event.type);
                                return (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded bg-gradient-to-r ${eventType.color}/20 text-white truncate`}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Upcoming Events & Add Form */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {upcomingEvents.map(event => {
                    const eventType = getEventTypeInfo(event.type);
                    const Icon = eventType.icon;
                    const daysLeft = getDaysUntil(event.date);
                    
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${eventType.color}/20`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                          {daysLeft >= 0 && (
                            <p className="text-xs text-purple-400">
                              {daysLeft === 0 ? 'Today!' : `${daysLeft} days left`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {upcomingEvents.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No upcoming events</p>
                  )}
                </div>
              </motion.div>

              {/* Add/Edit Event Form */}
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-effect border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter event title..."
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {eventTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.name}
                              onClick={() => setNewEvent(prev => ({ ...prev, type: type.name as any }))}
                              className={`
                                p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1
                                ${newEvent.type === type.name
                                  ? `bg-gradient-to-r ${type.color}/20 border-white/30`
                                  : 'border-white/10 hover:border-white/20 bg-white/5'
                                }
                              `}
                            >
                              <Icon size={16} />
                              <span className="text-xs">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add a description..."
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Location (optional)</label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location..."
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="countdown"
                        checked={newEvent.isCountdown}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, isCountdown: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-white/5 border border-white/10 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="countdown" className="text-sm">Show countdown for this event</label>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                        className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                      >
                        {editingEvent ? 'Update Event' : 'Add Event'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingEvent(null);
                          setNewEvent({
                            title: '',
                            date: '',
                            type: 'other',
                            description: '',
                            location: '',
                            isCountdown: false
                          });
                        }}
                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RelationshipCalendar; 
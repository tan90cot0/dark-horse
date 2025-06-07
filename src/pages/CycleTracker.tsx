import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Flower, Moon, Sun, Droplets, Smile, Frown, Meh, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface CycleEntry {
  date: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'none';
  mood: 'happy' | 'neutral' | 'sad' | 'none';
  symptoms: string[];
  notes: string;
  isPeriodStart?: boolean;
}

function CycleTracker() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentEntry, setCurrentEntry] = useState<CycleEntry>({
    date: '',
    phase: 'none',
    mood: 'none',
    symptoms: [],
    notes: '',
    isPeriodStart: false
  });

  // Historical period start dates
  const historicalPeriods = [
    '2024-01-12', '2024-02-07', '2024-03-15', '2024-04-12', '2024-05-08', '2024-06-02',
    '2024-07-05', '2024-07-31', '2024-08-26', '2024-09-24', '2024-10-22', '2024-11-17',
    '2024-12-16', '2025-01-16', '2025-02-14', '2025-03-16', '2025-04-11', '2025-05-06',
    '2025-06-02'
  ];

  const cyclePhases = [
    { name: 'menstrual', label: 'Menstrual', color: 'from-red-500 to-pink-500', icon: Droplets },
    { name: 'follicular', label: 'Follicular', color: 'from-green-500 to-emerald-500', icon: Flower },
    { name: 'ovulation', label: 'Ovulation', color: 'from-yellow-500 to-orange-500', icon: Sun },
    { name: 'luteal', label: 'Luteal', color: 'from-purple-500 to-indigo-500', icon: Moon }
  ];

  const symptoms = [
    'Cramps', 'Bloating', 'Headache', 'Fatigue', 'Breast tenderness',
    'Mood swings', 'Acne', 'Food cravings', 'Back pain', 'Nausea'
  ];

  const moodIcons = {
    happy: { icon: Smile, color: 'text-green-400' },
    neutral: { icon: Meh, color: 'text-yellow-400' },
    sad: { icon: Frown, color: 'text-red-400' }
  };

  // Calculate cycle phases based on period start date
  const calculatePhases = (periodStart: string) => {
    const startDate = new Date(periodStart);
    const phases = [];
    
    // Menstrual phase: days 1-5
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'menstrual' as const,
        isPeriodStart: i === 0
      });
    }
    
    // Follicular phase: days 6-13
    for (let i = 5; i < 13; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'follicular' as const
      });
    }
    
    // Ovulation phase: days 14-16
    for (let i = 13; i < 16; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'ovulation' as const
      });
    }
    
    // Luteal phase: days 17-28
    for (let i = 16; i < 28; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'luteal' as const
      });
    }
    
    return phases;
  };

  // Initialize historical data
  useEffect(() => {
    const savedEntries = localStorage.getItem('cycleEntries');
    
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Generate historical cycle data
      const historicalEntries: CycleEntry[] = [];
      
      historicalPeriods.forEach(periodDate => {
        const phases = calculatePhases(periodDate);
        phases.forEach(phase => {
          historicalEntries.push({
            date: phase.date,
            phase: phase.phase,
            mood: 'none',
            symptoms: [],
            notes: '',
            isPeriodStart: phase.isPeriodStart || false
          });
        });
      });
      
      setEntries(historicalEntries);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('cycleEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const existingEntry = entries.find(entry => entry.date === date);
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        date,
        phase: 'none',
        mood: 'none',
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const markPeriodStart = () => {
    if (!selectedDate) return;
    
    // Generate phases for this period cycle
    const newPhases = calculatePhases(selectedDate);
    
    // Remove existing entries for these dates and add new ones
    const filteredEntries = entries.filter(entry => 
      !newPhases.some(phase => phase.date === entry.date)
    );
    
    const newEntries = newPhases.map(phase => ({
      date: phase.date,
      phase: phase.phase,
      mood: 'none' as const,
      symptoms: [] as string[],
      notes: '',
      isPeriodStart: phase.isPeriodStart || false
    }));
    
    setEntries([...filteredEntries, ...newEntries]);
    setSelectedDate('');
    setCurrentEntry({
      date: '',
      phase: 'none',
      mood: 'none',
      symptoms: [],
      notes: '',
      isPeriodStart: false
    });
  };

  const saveEntry = () => {
    if (!selectedDate) return;
    
    const updatedEntries = entries.filter(entry => entry.date !== selectedDate);
    if (currentEntry.phase !== 'none' || currentEntry.mood !== 'none' || currentEntry.symptoms.length > 0 || currentEntry.notes) {
      updatedEntries.push(currentEntry);
    }
    
    setEntries(updatedEntries);
    setSelectedDate('');
    setCurrentEntry({
      date: '',
      phase: 'none',
      mood: 'none',
      symptoms: [],
      notes: '',
      isPeriodStart: false
    });
  };

  const getNextPeriodPrediction = () => {
    const periodStarts = entries
      .filter(entry => entry.isPeriodStart)
      .map(entry => entry.date)
      .sort();
    
    if (periodStarts.length < 2) return null;
    
    // Calculate average cycle length
    const cycles = [];
    for (let i = 1; i < periodStarts.length; i++) {
      const diff = Math.abs(new Date(periodStarts[i]).getTime() - new Date(periodStarts[i-1]).getTime());
      cycles.push(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    
    const averageCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    const lastPeriod = new Date(periodStarts[periodStarts.length - 1]);
    const nextPeriod = new Date(lastPeriod.getTime() + (averageCycle * 24 * 60 * 60 * 1000));
    
    return { nextPeriod, averageCycle, lastPeriod: lastPeriod };
  };

  const prediction = getNextPeriodPrediction();

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    // Generate last 60 days and next 60 days for better coverage
    for (let i = 60; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      days.push(date.toISOString().split('T')[0]);
    }
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const getEntryForDate = (date: string) => {
    return entries.find(entry => entry.date === date);
  };

  const getDaysUntilNextPeriod = () => {
    if (!prediction) return null;
    const today = new Date();
    const diffTime = prediction.nextPeriod.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilNext = getDaysUntilNextPeriod();

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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center glass-effect rounded-full px-6 py-2 border border-white/10 mb-4"
            >
              <Heart className="text-pink-400 mr-2" size={18} />
              <span className="text-base font-medium">Wellness Tracker</span>
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Cycle & Mood Tracker</h1>
            <p className="text-gray-400">Track your wellness journey with love and care 💕</p>
          </div>

          {/* Next Period Prediction Card */}
          {prediction && daysUntilNext !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect border border-white/10 rounded-2xl p-6 mb-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    <CalendarIcon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Next Period</h3>
                    <p className="text-gray-400 text-sm">Expected on {prediction.nextPeriod.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    {daysUntilNext > 0 ? daysUntilNext : 'Today!'}
                  </div>
                  <div className="text-sm text-gray-300">
                    {daysUntilNext > 0 ? (daysUntilNext === 1 ? 'day left' : 'days left') : 'Expected today'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid md:grid-cols-3 gap-4 mb-8"
            >
              <div className="glass-effect border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Calendar className="mr-2 text-purple-400" size={20} />
                  Average Cycle
                </h3>
                <p className="text-2xl font-bold text-purple-400">{prediction.averageCycle} days</p>
              </div>
              <div className="glass-effect border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Droplets className="mr-2 text-red-400" size={20} />
                  Last Period
                </h3>
                <p className="text-2xl font-bold text-red-400">{prediction.lastPeriod.toLocaleDateString()}</p>
              </div>
              <div className="glass-effect border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Heart className="mr-2 text-pink-400" size={20} />
                  Total Cycles
                </h3>
                <p className="text-2xl font-bold text-pink-400">{entries.filter(e => e.isPeriodStart).length}</p>
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
                <h3 className="text-xl font-semibold mb-4">Calendar View</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 max-h-96 overflow-y-auto">
                  {generateCalendarDays().map(date => {
                    const entry = getEntryForDate(date);
                    const dateObj = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    const isSelected = date === selectedDate;
                    
                    return (
                      <motion.button
                        key={date}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDateSelect(date)}
                        className={`
                          relative p-2 text-sm rounded-lg transition-all duration-200
                          ${isSelected ? 'bg-purple-500/30 border border-purple-400' : 'hover:bg-white/10'}
                          ${isToday ? 'ring-2 ring-blue-400' : ''}
                        `}
                      >
                        <span className={`${isToday ? 'font-bold text-blue-400' : ''}`}>
                          {dateObj.getDate()}
                        </span>
                        {entry && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {entry.phase !== 'none' && (
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${cyclePhases.find(p => p.name === entry.phase)?.color}`}></div>
                            )}
                            {entry.mood !== 'none' && (
                              <div className={`w-2 h-2 rounded-full ${moodIcons[entry.mood].color.replace('text-', 'bg-')}`}></div>
                            )}
                            {entry.isPeriodStart && (
                              <div className="w-2 h-2 rounded-full bg-red-500 ring-1 ring-white"></div>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Entry Form */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold mb-4">
                  {selectedDate ? `Track ${new Date(selectedDate).toLocaleDateString()}` : 'Select a Date'}
                </h3>
                
                {selectedDate && (
                  <>
                    {/* Mark Period Start Button */}
                    <div className="mb-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={markPeriodStart}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Mark Period Start
                      </motion.button>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        This will automatically calculate all cycle phases
                      </p>
                    </div>

                    {/* Cycle Phase */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Cycle Phase</label>
                      <div className="grid grid-cols-2 gap-2">
                        {cyclePhases.map(phase => {
                          const Icon = phase.icon;
                          return (
                            <button
                              key={phase.name}
                              onClick={() => setCurrentEntry(prev => ({ ...prev, phase: phase.name as any }))}
                              className={`
                                p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2
                                ${currentEntry.phase === phase.name
                                  ? `bg-gradient-to-r ${phase.color} border-white/30`
                                  : 'border-white/10 hover:border-white/20 bg-white/5'
                                }
                              `}
                            >
                              <Icon size={20} />
                              <span className="text-xs">{phase.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Mood</label>
                      <div className="flex gap-2">
                        {Object.entries(moodIcons).map(([mood, { icon: Icon, color }]) => (
                          <button
                            key={mood}
                            onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood as any }))}
                            className={`
                              p-3 rounded-xl border transition-all duration-200 flex-1 flex flex-col items-center gap-2
                              ${currentEntry.mood === mood
                                ? 'border-white/30 bg-white/10'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                              }
                            `}
                          >
                            <Icon size={18} className={color} />
                            <span className="text-xs capitalize">{mood}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Symptoms</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {symptoms.map(symptom => (
                          <button
                            key={symptom}
                            onClick={() => handleSymptomToggle(symptom)}
                            className={`
                              p-2 text-xs rounded-lg border transition-all duration-200
                              ${currentEntry.symptoms.includes(symptom)
                                ? 'bg-pink-500/20 border-pink-400/50 text-pink-200'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                              }
                            `}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Notes</label>
                      <textarea
                        value={currentEntry.notes}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="How are you feeling today?"
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={saveEntry}
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Save Entry
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CycleTracker; 
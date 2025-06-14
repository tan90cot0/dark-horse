import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Flower, Moon, Sun, Droplets, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CycleEntry {
  date: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'none';
  symptoms: string[];
  notes: string;
  isPeriodStart?: boolean;
}

function CycleTracker() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState<CycleEntry>({
    date: '',
    phase: 'none',
    symptoms: [],
    notes: '',
    isPeriodStart: false
  });

  // Historical period start dates - EXACT dates as given
  const historicalPeriods = [
    // 2021
    '2021-01-15', '2021-02-06', '2021-03-12', '2021-04-06', '2021-05-01', '2021-05-28',
    '2021-06-24', '2021-07-22', '2021-08-24', '2021-09-24', '2021-10-22', '2021-11-20', '2021-12-16',
    
    // 2022
    '2022-01-18', '2022-02-22', '2022-03-22', '2022-04-19', '2022-05-20', '2022-06-17',
    '2022-07-13', '2022-08-11', '2022-09-09', '2022-10-08', '2022-11-06', '2022-12-05', '2022-12-30',
    
    // 2023
    '2023-01-31', '2023-03-01', '2023-03-29', '2023-04-26', '2023-05-24', '2023-06-21',
    '2023-07-20', '2023-08-20', '2023-09-18', '2023-10-17', '2023-11-14', '2023-12-14',
    
    // 2024
    '2024-01-12', '2024-02-07', '2024-03-15', '2024-04-12', '2024-05-08', '2024-06-02',
    '2024-07-05', '2024-07-31', '2024-08-26', '2024-09-24', '2024-10-22', '2024-11-17', '2024-12-16',
    
    // 2025
    '2025-01-16', '2025-02-14', '2025-03-16', '2025-04-11', '2025-05-06', '2025-06-02'
  ];

  // Current period start (last one in the list)
  const currentPeriodStart = '2025-06-02';

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

  // Generate current cycle phases automatically
  const generateCurrentCycle = () => {
    const startDate = new Date(currentPeriodStart);
    const phases = [];
    
    // Day 1: Period start (June 2)
    phases.push({
      date: currentPeriodStart,
      phase: 'menstrual' as const,
      symptoms: [],
      notes: '',
      isPeriodStart: true
    });
    
    // Days 2-5: Menstrual phase (June 3-6)
    for (let i = 1; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'menstrual' as const,
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
    
    // Days 6-13: Follicular phase (June 7-14)
    for (let i = 5; i < 13; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'follicular' as const,
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
    
    // Days 14-16: Ovulation phase (June 15-17)
    for (let i = 13; i < 16; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'ovulation' as const,
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
    
    // Days 17-28: Luteal phase (June 18-30)
    for (let i = 16; i < 28; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      phases.push({
        date: date.toISOString().split('T')[0],
        phase: 'luteal' as const,
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
    
    return phases;
  };

  // Initialize everything automatically on load
  useEffect(() => {
    console.log('Initializing cycle tracker...');
    console.log('Historical periods:', historicalPeriods);
    console.log('Current period start:', currentPeriodStart);
    
    // Always generate fresh current cycle data
    const currentCycle = generateCurrentCycle();
    console.log('Generated current cycle:', currentCycle.length, 'entries');
    
    setEntries(currentCycle);
  }, []); // Empty dependency array means this runs once on mount

  // Save data to localStorage when entries change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('cycleEntries', JSON.stringify(entries));
      console.log('Saved', entries.length, 'entries to localStorage');
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

  const markNewPeriodStart = () => {
    if (!selectedDate) return;
    
    console.log('Marking new period start:', selectedDate);
    
    // Generate new cycle from selected date
    const startDate = new Date(selectedDate);
    const newCycle = [];
    
    // Day 1: Period start
    newCycle.push({
      date: selectedDate,
      phase: 'menstrual' as const,
      symptoms: [],
      notes: '',
      isPeriodStart: true
    });
    
    // Days 2-28: Continue cycle
    for (let i = 1; i < 28; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      let phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
      if (i < 5) phase = 'menstrual';
      else if (i < 13) phase = 'follicular';
      else if (i < 16) phase = 'ovulation';
      else phase = 'luteal';
      
      newCycle.push({
        date: date.toISOString().split('T')[0],
        phase,
        symptoms: [],
        notes: '',
        isPeriodStart: false
      });
    }
    
    setEntries(newCycle);
    setSelectedDate('');
    setCurrentEntry({
      date: '',
      phase: 'none',
      symptoms: [],
      notes: '',
      isPeriodStart: false
    });
  };

  const saveEntry = () => {
    if (!selectedDate) return;
    
    const updatedEntries = entries.filter(entry => entry.date !== selectedDate);
    if (currentEntry.phase !== 'none' || currentEntry.symptoms.length > 0 || currentEntry.notes) {
      updatedEntries.push(currentEntry);
    }
    
    setEntries(updatedEntries);
    setSelectedDate('');
    setCurrentEntry({
      date: '',
      phase: 'none',
      symptoms: [],
      notes: '',
      isPeriodStart: false
    });
  };

  const getNextPeriodPrediction = () => {
    // Include current period start in calculation
    const allPeriods = [...historicalPeriods];
    
    // Add any new periods marked by user
    const userPeriods = entries
      .filter(entry => entry.isPeriodStart && !historicalPeriods.includes(entry.date))
      .map(entry => entry.date);
    
    allPeriods.push(...userPeriods);
    allPeriods.sort();
    
    if (allPeriods.length < 2) return null;
    
    // Calculate average cycle length from historical data
    const cycles = [];
    for (let i = 1; i < allPeriods.length; i++) {
      const diff = Math.abs(new Date(allPeriods[i]).getTime() - new Date(allPeriods[i-1]).getTime());
      cycles.push(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    
    const averageCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    const lastPeriod = new Date(allPeriods[allPeriods.length - 1]);
    
    // For current cycle, use 28 days (since we're tracking a 28-day cycle)
    const nextPeriod = new Date(lastPeriod.getTime() + (28 * 24 * 60 * 60 * 1000));
    
    return { nextPeriod, averageCycle, lastPeriod, totalCycles: allPeriods.length };
  };

  const prediction = getNextPeriodPrediction();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-12"></div>;
          }
          
          // Fix timezone issue by formatting date properly
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const isToday = dateString === todayString;
          const isSelected = dateString === selectedDate;
          
          // Check if this is a historical period (excluding current period which is tracked)
          const isHistoricalPeriod = historicalPeriods.includes(dateString) && dateString !== currentPeriodStart;
          
          // Check if this is part of current cycle tracking
          const currentCycleEntry = entries.find(entry => entry.date === dateString);
          
          return (
            <motion.button
              key={dateString}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateSelect(dateString)}
              className={`
                relative h-12 p-1 rounded-lg transition-all duration-200 border
                ${isSelected ? 'bg-purple-500/30 border border-purple-400' : 'hover:bg-white/10 border-white/10'}
                ${isToday ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-400' : ''}`}>
                {date.getDate()}
              </div>
              
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                {/* Historical period markers - small red dots */}
                {isHistoricalPeriod && (
                  <div className="w-2 h-2 rounded-full bg-red-400 opacity-70"></div>
                )}
                
                {/* Current cycle tracking */}
                {currentCycleEntry && (
                  <>
                    {currentCycleEntry.isPeriodStart ? (
                      <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-white"></div>
                    ) : currentCycleEntry.phase !== 'none' ? (
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${cyclePhases.find(p => p.name === currentCycleEntry.phase)?.color}`}></div>
                    ) : null}
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
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
            <h1 className="text-4xl font-bold gradient-text mb-2">Cycle Tracker</h1>
            <p className="text-gray-400">Track your cycle with love and care 💕</p>
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
                  Total Periods
                </h3>
                <p className="text-2xl font-bold text-pink-400">{prediction.totalCycles}</p>
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
                  <h3 className="text-2xl font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition-colors rounded-lg text-sm"
                    >
                      Today
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                </div>
                
                {renderCalendarGrid()}
                
                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Legend</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                      <span className="text-gray-300">Menstrual (1-5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      <span className="text-gray-300">Follicular (6-13)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <span className="text-gray-300">Ovulation (14-16)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                      <span className="text-gray-300">Luteal (17-28)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-white"></div>
                      <span className="text-gray-300">Period Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 opacity-70"></div>
                      <span className="text-gray-300">Historical Period</span>
                    </div>
                  </div>
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
                        onClick={markNewPeriodStart}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Mark New Period Start
                      </motion.button>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        This will start tracking a new 28-day cycle
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Notes</label>
                      <textarea
                        value={currentEntry.notes}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="How are you feeling today?"
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                        rows={4}
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
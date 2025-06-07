import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Trash2, Edit, Send, X, Palette } from 'lucide-react';
import dataService, { Announcement } from '../utils/dataService';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

function NoticeBoard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [selectedAuthor, setSelectedAuthor] = useState('Aryan');
  
  const { showSuccess, showError, showInfo } = useNotification();

  const colors = [
    { name: 'purple', class: 'from-purple-600 to-purple-700', bg: 'bg-purple-500/20' },
    { name: 'blue', class: 'from-blue-600 to-blue-700', bg: 'bg-blue-500/20' },
    { name: 'pink', class: 'from-pink-600 to-pink-700', bg: 'bg-pink-500/20' },
    { name: 'green', class: 'from-green-600 to-green-700', bg: 'bg-green-500/20' },
    { name: 'yellow', class: 'from-yellow-600 to-yellow-700', bg: 'bg-yellow-500/20' },
    { name: 'indigo', class: 'from-indigo-600 to-indigo-700', bg: 'bg-indigo-500/20' }
  ];

  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getAnnouncements();
        setAnnouncements(data);
        setError(null);
        if (data.length === 0) {
          showInfo('Notice board is empty', 'Add your first announcement!');
        }
      } catch (error) {
        console.error('Error loading announcements:', error);
        setError('Failed to load announcements. Please try again later.');
        showError('Failed to load notices', 'Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnnouncements();
  }, [showError, showInfo]);

  const handleAddAnnouncement = async () => {
    if (!newAnnouncementText.trim()) {
      showError('Message required', 'Please enter a message for your announcement.');
      return;
    }

    try {
      const newAnnouncement: Omit<Announcement, 'id'> = {
        text: newAnnouncementText.trim(),
        author: selectedAuthor,
        timestamp: new Date(),
        color: selectedColor
      };

      const savedAnnouncement = await dataService.addAnnouncement(newAnnouncement);
      setAnnouncements(prev => [savedAnnouncement, ...prev]);
      setNewAnnouncementText('');
      setShowAddModal(false);
      showSuccess('Notice posted!', 'Your announcement has been added to the board.');
    } catch (error) {
      console.error('Error adding announcement:', error);
      showError('Failed to post', 'Could not add your announcement. Please try again.');
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement || !newAnnouncementText.trim()) {
      showError('Message required', 'Please enter a message for your announcement.');
      return;
    }

    try {
      const updatedAnnouncement = await dataService.updateAnnouncement(editingAnnouncement.id, {
        text: newAnnouncementText.trim(),
        color: selectedColor
      });

      if (updatedAnnouncement) {
        setAnnouncements(prev =>
          prev.map(ann => ann.id === editingAnnouncement.id ? updatedAnnouncement : ann)
        );
        setEditingAnnouncement(null);
        setNewAnnouncementText('');
        setShowAddModal(false);
        showSuccess('Notice updated!', 'Your announcement has been updated successfully.');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      showError('Update failed', 'Could not update your announcement. Please try again.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const success = await dataService.deleteAnnouncement(id);
        if (success) {
          setAnnouncements(prev => prev.filter(ann => ann.id !== id));
          showSuccess('Notice deleted', 'The announcement has been removed.');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        showError('Delete failed', 'Could not delete the announcement. Please try again.');
      }
    }
  };

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setNewAnnouncementText('');
    setSelectedColor('purple');
    setSelectedAuthor('Aryan');
    setShowAddModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncementText(announcement.text);
    setSelectedColor(announcement.color || 'purple');
    setSelectedAuthor(announcement.author);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAnnouncement(null);
    setNewAnnouncementText('');
  };

  const getColorClass = (colorName: string) => {
    return colors.find(c => c.name === colorName)?.class || colors[0].class;
  };

  const getBgClass = (colorName: string) => {
    return colors.find(c => c.name === colorName)?.bg || colors[0].bg;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner message="Loading notices..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8 glass-effect rounded-lg border border-white/10 max-w-md">
          <div className="text-red-400 mb-4">
            <MessageSquare size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Notices</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
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
      {/* Enhanced background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
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
              <MessageSquare className="text-purple-400 mr-2" size={18} />
              <span className="text-base font-medium">Digital Notice Board</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Our Announcements
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto mb-8">
              Share thoughts, updates, and important announcements with each other.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              Add Notice
            </motion.button>
          </motion.div>

          {/* Content */}
          {announcements.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              variants={itemVariants}
            >
              <div className="glass-effect rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                <MessageSquare size={64} className="mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold mb-4">No Notices Yet</h3>
                <p className="text-gray-300 mb-6">Start the conversation by posting your first announcement!</p>
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Post First Notice
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect border border-white/10 rounded-2xl p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getColorClass(announcement.color || 'purple')} flex items-center justify-center text-white font-bold`}>
                        {announcement.author[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{announcement.author}</h4>
                        <p className="text-xs text-gray-400">{formatTimestamp(announcement.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="p-2 rounded-full bg-white/5 text-white/70 hover:bg-blue-600 hover:text-white transition-all duration-300"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 rounded-full bg-white/5 text-white/70 hover:bg-red-600 hover:text-white transition-all duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getBgClass(announcement.color || 'purple')} border border-white/10`}>
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{announcement.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-effect border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingAnnouncement ? 'Edit Notice' : 'Add New Notice'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {!editingAnnouncement && (
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors"
                  >
                    <option value="Aryan">Aryan</option>
                    <option value="Prisha">Prisha</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 transition-colors h-32 resize-none"
                  placeholder="What would you like to announce?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="flex space-x-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${color.class} border-2 ${
                        selectedColor === color.name ? 'border-white' : 'border-transparent'
                      } transition-all duration-300`}
                    >
                      {selectedColor === color.name && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <Palette size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
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
                onClick={editingAnnouncement ? handleEditAnnouncement : handleAddAnnouncement}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center"
              >
                <Send size={16} className="mr-2" />
                {editingAnnouncement ? 'Update' : 'Post'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;
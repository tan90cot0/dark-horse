/**
 * Data Service
 * 
 * This utility handles data storage and retrieval, currently using localStorage
 * but designed to be easily replaceable with a real API when available.
 */
import { mapData, MapData, Marker, getMapData } from '../data/mapData';

// Type definitions for stored data
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  isHighlight?: boolean;
}

export interface Announcement {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  color?: string;
}

// Sample initial data for first-time use
const initialData = {
  timelineEvents: [
    {
      id: '1',
      date: 'March 15, 2024',
      title: 'First Meeting',
      description: 'Where it all began. Initial brainstorming and concept development for our collaborative project.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isHighlight: true
    },
    {
      id: '2',
      date: 'March 20, 2024',
      title: 'Project Kickoff',
      description: 'Working together on our first project. Setting up the development environment and creating initial designs.',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ] as TimelineEvent[],
  
  announcements: [
    {
      id: '1',
      text: 'Welcome to our private notice board! Share thoughts and updates here.',
      author: 'Aryan',
      timestamp: new Date(),
      color: 'purple'
    }
  ] as Announcement[]
};

/**
 * Data Service class to handle storage and retrieval
 * This abstraction makes it easy to replace localStorage with a real API later
 */
class DataService {
  // Generic fetch method that can be used for any data type
  async fetch<T>(key: string, defaultData: T[]): Promise<T[]> {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        // Handle Date objects that were stringified
        if (key === 'announcements') {
          return JSON.parse(storedData, (key, value) => {
            if (key === 'timestamp') return new Date(value);
            return value;
          });
        }
        return JSON.parse(storedData);
      } else {
        // First time use - initialize with default data
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return defaultData;
    }
  }

  // Generic save method
  async save<T>(key: string, data: T[]): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  // Timeline Events - Now with JSON file fetching
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    try {
      // First try to fetch the timeline data from JSON file
      const response = await fetch('/data/timelineData.json');
      
      if (response.ok) {
        const data = await response.json();
        
        // Save the fetched data to localStorage for offline use
        this.saveTimelineEvents(data);
        
        return data;
      } else {
        console.warn('Could not fetch timeline data from JSON, falling back to localStorage');
        // If fetch fails, fall back to localStorage
        return this.fetch<TimelineEvent>('timelineEvents', initialData.timelineEvents);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      // If an error occurs, fall back to localStorage
      return this.fetch<TimelineEvent>('timelineEvents', initialData.timelineEvents);
    }
  }

  async saveTimelineEvents(events: TimelineEvent[]): Promise<void> {
    return this.save('timelineEvents', events);
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return this.fetch<Announcement>('announcements', initialData.announcements);
  }

  async saveAnnouncements(announcements: Announcement[]): Promise<void> {
    return this.save('announcements', announcements);
  }

  // Map Locations - now using the dedicated mapData module
  async getMapData(): Promise<MapData> {
    return getMapData();
  }

  // CRUD operations for TimelineEvents
  async addTimelineEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      ...event,
      id: this.generateId()
    };
    
    const currentEvents = await this.getTimelineEvents();
    await this.saveTimelineEvents([...currentEvents, newEvent]);
    
    return newEvent;
  }

  async updateTimelineEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent | null> {
    const currentEvents = await this.getTimelineEvents();
    const eventIndex = currentEvents.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return null;
    }
    
    const updatedEvent = {
      ...currentEvents[eventIndex],
      ...updates
    };
    
    currentEvents[eventIndex] = updatedEvent;
    await this.saveTimelineEvents(currentEvents);
    
    return updatedEvent;
  }

  async deleteTimelineEvent(id: string): Promise<boolean> {
    const currentEvents = await this.getTimelineEvents();
    const updatedEvents = currentEvents.filter(event => event.id !== id);
    
    if (updatedEvents.length === currentEvents.length) {
      return false; // No event was deleted
    }
    
    await this.saveTimelineEvents(updatedEvents);
    return true;
  }

  // CRUD operations for Announcements
  async addAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: this.generateId()
    };
    
    const currentAnnouncements = await this.getAnnouncements();
    await this.saveAnnouncements([newAnnouncement, ...currentAnnouncements]);
    
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | null> {
    const currentAnnouncements = await this.getAnnouncements();
    const announcementIndex = currentAnnouncements.findIndex(announcement => announcement.id === id);
    
    if (announcementIndex === -1) {
      return null;
    }
    
    const updatedAnnouncement = {
      ...currentAnnouncements[announcementIndex],
      ...updates
    };
    
    currentAnnouncements[announcementIndex] = updatedAnnouncement;
    await this.saveAnnouncements(currentAnnouncements);
    
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const currentAnnouncements = await this.getAnnouncements();
    const updatedAnnouncements = currentAnnouncements.filter(announcement => announcement.id !== id);
    
    if (updatedAnnouncements.length === currentAnnouncements.length) {
      return false; // No announcement was deleted
    }
    
    await this.saveAnnouncements(updatedAnnouncements);
    return true;
  }

  // Generate a unique ID (for adding new items)
  generateId(): string {
    return Date.now().toString();
  }
}

// Export a singleton instance
export default new DataService();
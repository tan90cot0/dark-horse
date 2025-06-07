/**
 * Truly Minimal Data Service - Incremental Loading Only
 * 
 * Loads only 3 memories at a time, no bulk operations
 */

// Type definitions
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  isHighlight?: boolean;
  imageLoaded?: boolean;
  category?: string;
  emotions?: string[];
  images?: string[];
  // ALL additional fields from diary.json analysis
  activities?: string[] | string;
  adventure?: string;
  attempted_dish?: string;
  benefit?: string;
  budget_notes?: string;
  care?: string;
  care_actions?: string[] | string;
  celebration_type?: string;
  comfort_items?: string[] | string;
  companions?: string[] | string;
  conflict?: string;
  constraint?: string;
  context?: string;
  details?: string;
  devotion?: string;
  discovery?: string;
  doctor_quote?: string;
  eating_pattern?: string;
  effort?: string;
  emotional_detail?: string;
  emotional_impact?: string;
  emotional_support?: string;
  event?: string;
  famous_quote?: string;
  favorite_moment?: string;
  festival?: string;
  first_experience?: string;
  firsts?: string[] | string;
  flex?: string;
  food?: string;
  food_choice?: string;
  gesture?: string;
  gift?: string;
  gifts?: string;
  incident?: string;
  ingredients?: string[] | string;
  initial_feeling?: string;
  location?: string;
  locations?: string[] | string;
  logistics?: string;
  medical_concern?: string;
  medical_details?: string;
  memorable_event?: string;
  memorable_incident?: string;
  memorable_items?: string[] | string;
  memorable_quote?: string;
  method?: string;
  milestone?: string;
  note?: string;
  notes?: string;
  observation?: string;
  occasion?: string;
  order?: string;
  organization?: string;
  outcome?: string;
  outlet?: string;
  pattern?: string;
  promise?: string;
  realization?: string;
  regret?: string;
  response?: string;
  restaurant?: string;
  restaurants?: string[] | string;
  role?: string;
  saved_message?: string;
  separation_duration?: string;
  significance?: string;
  song?: string;
  song_type?: string;
  special_quotes?: string[] | string;
  strategy?: string;
  successful_dish?: string;
  surprise_element?: string;
  telegram_detail?: string;
  time?: string;
  timing?: string;
  trigger?: string;
  unique_elements?: string[] | string;
  witnesses?: string[] | string;
  [key: string]: any; // For any other dynamic fields
}

export interface Announcement {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  color?: string;
}

// Minimal memory data
interface DiaryMemory {
  id: number;
  title: string;
  date: string | null;
  category: string;
  content: string;
  emotions?: string[];
  images?: string[];
  // ALL additional fields from diary.json analysis
  activities?: string[] | string;
  adventure?: string;
  attempted_dish?: string;
  benefit?: string;
  budget_notes?: string;
  care?: string;
  care_actions?: string[] | string;
  celebration_type?: string;
  comfort_items?: string[] | string;
  companions?: string[] | string;
  conflict?: string;
  constraint?: string;
  context?: string;
  details?: string;
  devotion?: string;
  discovery?: string;
  doctor_quote?: string;
  eating_pattern?: string;
  effort?: string;
  emotional_detail?: string;
  emotional_impact?: string;
  emotional_support?: string;
  event?: string;
  famous_quote?: string;
  favorite_moment?: string;
  festival?: string;
  first_experience?: string;
  firsts?: string[] | string;
  flex?: string;
  food?: string;
  food_choice?: string;
  gesture?: string;
  gift?: string;
  gifts?: string;
  incident?: string;
  ingredients?: string[] | string;
  initial_feeling?: string;
  location?: string;
  locations?: string[] | string;
  logistics?: string;
  medical_concern?: string;
  medical_details?: string;
  memorable_event?: string;
  memorable_incident?: string;
  memorable_items?: string[] | string;
  memorable_quote?: string;
  method?: string;
  milestone?: string;
  note?: string;
  notes?: string;
  observation?: string;
  occasion?: string;
  order?: string;
  organization?: string;
  outcome?: string;
  outlet?: string;
  pattern?: string;
  promise?: string;
  realization?: string;
  regret?: string;
  response?: string;
  restaurant?: string;
  restaurants?: string[] | string;
  role?: string;
  saved_message?: string;
  separation_duration?: string;
  significance?: string;
  song?: string;
  song_type?: string;
  special_quotes?: string[] | string;
  strategy?: string;
  successful_dish?: string;
  surprise_element?: string;
  telegram_detail?: string;
  time?: string;
  timing?: string;
  trigger?: string;
  unique_elements?: string[] | string;
  witnesses?: string[] | string;
  isHighlight?: boolean;
  [key: string]: any; // For any other dynamic fields
}

// Cache for loaded data chunks
class DataService {
  private allMemoriesCache: DiaryMemory[] | null = null;
  private loadedMemoryPages: Map<number, DiaryMemory[]> = new Map();
  private imageMetadataCache: Map<number, string> | null = null;
  private singleImageCache: Map<string, string> = new Map();
  private activeRequests: Set<string> = new Set();

  // Page size for incremental loading - reduced to 1 for maximum performance
  private readonly PAGE_SIZE = 1;

  // Load only essential metadata first (no content)
  async loadMemoryMetadata(): Promise<{ total: number; pages: number }> {
    if (this.allMemoriesCache) {
      return {
        total: this.allMemoriesCache.length,
        pages: Math.ceil(this.allMemoriesCache.length / this.PAGE_SIZE)
      };
    }

    try {
      console.log('Loading memory metadata only...');
      
      // Load diary but don't store all memories in memory at once
      const response = await fetch('/data/diary.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const diaryData = await response.json();
      this.allMemoriesCache = diaryData.memories || [];
      
      const total = this.allMemoriesCache?.length || 0;
      const pages = Math.ceil(total / this.PAGE_SIZE);
      
      console.log(`Found ${total} memories, ${pages} pages`);
      return { total, pages };
    } catch (error) {
      console.error('Error loading memory metadata:', error);
      return { total: 0, pages: 0 };
    }
  }

  // Load specific page of memories
  async loadMemoryPage(page: number): Promise<DiaryMemory[]> {
    if (this.loadedMemoryPages.has(page)) {
      return this.loadedMemoryPages.get(page)!;
    }

    try {
      if (!this.allMemoriesCache) {
        await this.loadMemoryMetadata();
      }

      const startIndex = page * this.PAGE_SIZE;
      const endIndex = Math.min(startIndex + this.PAGE_SIZE, this.allMemoriesCache!.length);
      const pageMemories = this.allMemoriesCache!.slice(startIndex, endIndex);

      this.loadedMemoryPages.set(page, pageMemories);
      console.log(`Loaded page ${page}: ${pageMemories.length} memories`);
      
      return pageMemories;
    } catch (error) {
      console.error(`Error loading memory page ${page}:`, error);
      return [];
    }
  }

  // Convert memory to timeline event
  convertMemoryToTimelineEvent(memory: DiaryMemory): TimelineEvent {
    return {
      id: memory.id.toString(),
      title: memory.title,
      date: memory.date || '',
      description: memory.content,
      image: '', // No image initially
      isHighlight: memory.isHighlight || 
                   memory.significance === 'major_regret' || 
                   memory.significance?.includes('first_i_love_you') ||
                   memory.significance?.includes('first_in_person') ||
                   memory.significance?.includes('formal_proposal'),
      imageLoaded: false,
      category: memory.category,
      emotions: memory.emotions,
      images: memory.images,
      // Map ALL additional fields from diary.json
      activities: memory.activities,
      adventure: memory.adventure,
      attempted_dish: memory.attempted_dish,
      benefit: memory.benefit,
      budget_notes: memory.budget_notes,
      care: memory.care,
      care_actions: memory.care_actions,
      celebration_type: memory.celebration_type,
      comfort_items: memory.comfort_items,
      companions: memory.companions,
      conflict: memory.conflict,
      constraint: memory.constraint,
      context: memory.context,
      details: memory.details,
      devotion: memory.devotion,
      discovery: memory.discovery,
      doctor_quote: memory.doctor_quote,
      eating_pattern: memory.eating_pattern,
      effort: memory.effort,
      emotional_detail: memory.emotional_detail,
      emotional_impact: memory.emotional_impact,
      emotional_support: memory.emotional_support,
      event: memory.event,
      famous_quote: memory.famous_quote,
      favorite_moment: memory.favorite_moment,
      festival: memory.festival,
      first_experience: memory.first_experience,
      firsts: memory.firsts,
      flex: memory.flex,
      food: memory.food,
      food_choice: memory.food_choice,
      gesture: memory.gesture,
      gift: memory.gift,
      gifts: memory.gifts,
      incident: memory.incident,
      ingredients: memory.ingredients,
      initial_feeling: memory.initial_feeling,
      location: memory.location,
      locations: memory.locations,
      logistics: memory.logistics,
      medical_concern: memory.medical_concern,
      medical_details: memory.medical_details,
      memorable_event: memory.memorable_event,
      memorable_incident: memory.memorable_incident,
      memorable_items: memory.memorable_items,
      memorable_quote: memory.memorable_quote,
      method: memory.method,
      milestone: memory.milestone,
      note: memory.note,
      notes: memory.notes,
      observation: memory.observation,
      occasion: memory.occasion,
      order: memory.order,
      organization: memory.organization,
      outcome: memory.outcome,
      outlet: memory.outlet,
      pattern: memory.pattern,
      promise: memory.promise,
      realization: memory.realization,
      regret: memory.regret,
      response: memory.response,
      restaurant: memory.restaurant,
      restaurants: memory.restaurants,
      role: memory.role,
      saved_message: memory.saved_message,
      separation_duration: memory.separation_duration,
      significance: memory.significance,
      song: memory.song,
      song_type: memory.song_type,
      special_quotes: memory.special_quotes,
      strategy: memory.strategy,
      successful_dish: memory.successful_dish,
      surprise_element: memory.surprise_element,
      telegram_detail: memory.telegram_detail,
      time: memory.time,
      timing: memory.timing,
      trigger: memory.trigger,
      unique_elements: memory.unique_elements,
      witnesses: memory.witnesses
    };
  }

  // Get timeline events for specific page only
  async getTimelineEventsPage(page: number = 0): Promise<{ events: TimelineEvent[]; hasMore: boolean; total: number }> {
    try {
      const metadata = await this.loadMemoryMetadata();
      const memories = await this.loadMemoryPage(page);
      
      const events = memories.map(memory => this.convertMemoryToTimelineEvent(memory));
      
      // Sort this page only
      events.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      const hasMore = (page + 1) * this.PAGE_SIZE < metadata.total;
      
      console.log(`Page ${page}: ${events.length} events, hasMore: ${hasMore}`);
      
      return {
        events,
        hasMore,
        total: metadata.total
      };
    } catch (error) {
      console.error('Error getting timeline events page:', error);
      return { events: [], hasMore: false, total: 0 };
    }
  }

  // Load image metadata only when needed
  async loadImageMetadata(): Promise<Map<number, string>> {
    if (this.imageMetadataCache) {
      return this.imageMetadataCache;
    }

    try {
      console.log('Loading image metadata...');
      const response = await fetch('/data/image_metadata.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const metadataFile = await response.json();
      this.imageMetadataCache = new Map();
      
      // Map memory_id -> image_id
      if (metadataFile.image_references) {
        metadataFile.image_references.forEach((meta: any) => {
          this.imageMetadataCache!.set(meta.associated_memory_id, meta.image_id);
        });
      }
      
      console.log(`Loaded metadata for ${this.imageMetadataCache?.size || 0} images`);
      return this.imageMetadataCache;
    } catch (error) {
      console.error('Error loading image metadata:', error);
      this.imageMetadataCache = new Map();
      return this.imageMetadataCache;
    }
  }

  // Load single image without loading entire file
  async loadImageForEvent(event: TimelineEvent): Promise<string> {
    const cacheKey = `image_${event.id}`;
    
    if (this.singleImageCache.has(cacheKey)) {
      return this.singleImageCache.get(cacheKey)!;
    }

    if (this.activeRequests.has(cacheKey)) {
      // Wait for existing request
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.singleImageCache.has(cacheKey)) {
            resolve(this.singleImageCache.get(cacheKey)!);
          } else if (!this.activeRequests.has(cacheKey)) {
            resolve(''); // Request failed
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.activeRequests.add(cacheKey);

    try {
      const memoryId = parseInt(event.id);
      console.log(`Loading image for memory ${memoryId}: "${event.title}"`);
      
      const metadataMap = await this.loadImageMetadata();
      const imageId = metadataMap.get(memoryId);

      if (!imageId) {
        console.warn(`No image mapping found for memory ID: ${memoryId}`);
        return '';
      }

      console.log(`Memory ${memoryId} -> Image ${imageId}`);
      
      // Load the image data using the correct imageId
      const imageData = await this.loadSingleImageSmart(imageId);
      
      if (imageData) {
        this.singleImageCache.set(cacheKey, imageData);
        console.log(`✅ Image loaded for: ${event.title}`);
      } else {
        console.error(`❌ Failed to load image for: ${event.title}`);
      }
      
      return imageData;
    } catch (error) {
      console.error(`💥 Error loading image for event ${event.id}:`, error);
      return '';
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  // Smart single image loading - avoid loading entire file
  private async loadSingleImageSmart(imageId: string): Promise<string> {
    try {
      console.log(`Loading image ${imageId}...`);
      
      const response = await fetch('/data/timeline_images.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const imageArray = await response.json();
      
      // Find the image by ID
      const imageItem = imageArray.find((item: any) => {
        return item.id === imageId || 
               item.id === parseInt(imageId) || 
               item.id === imageId.toString();
      });
      
      if (imageItem && imageItem.image) {
        let imageData = imageItem.image;
        
        // Fix double data URL prefix issue
        if (imageData.startsWith('data:image/') && imageData.includes(';base64,data:image/')) {
          console.log(`Fixing double data URL prefix for image ${imageId}`);
          imageData = imageData.replace(/^data:image\/[^;]+;base64,data:image\/[^;]+;base64,/, 'data:image/jpeg;base64,');
        }
        
        // Ensure proper data URL format
        if (!imageData.startsWith('data:image/') && (imageData.startsWith('/9j/') || imageData.startsWith('iVBOR'))) {
          imageData = `data:image/jpeg;base64,${imageData}`;
        }
        
        console.log(`✅ Successfully loaded image ${imageId}`);
        return imageData;
      } else {
        console.error(`❌ Image ${imageId} not found in timeline_images.json`);
        return '';
      }
      
    } catch (error) {
      console.error(`💥 Error loading image ${imageId}:`, error);
      return '';
    }
  }

  // Legacy method for backward compatibility
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    const firstPage = await this.getTimelineEventsPage(0);
    return firstPage.events;
  }

  // LocalStorage operations (minimal)
  async getLocalStorageEvents(): Promise<TimelineEvent[]> {
    try {
      const storedData = localStorage.getItem('userTimelineEvents'); // Different key
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  async addTimelineEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      date: '',
      title: '',
      description: '',
      image: '',
      ...event,
      id: `user_${Date.now()}`, // Mark as user-added
      imageLoaded: true
    };
    
    const userEvents = await this.getLocalStorageEvents();
    userEvents.push(newEvent);
    
    try {
      localStorage.setItem('userTimelineEvents', JSON.stringify(userEvents));
    } catch (error) {
      console.error('Error saving user event:', error);
    }
    
    return newEvent;
  }

  // Announcements (unchanged but minimal)
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const storedData = localStorage.getItem('announcements');
      if (storedData) {
        return JSON.parse(storedData, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }
      return [];
    } catch (error) {
      console.error('Error loading announcements:', error);
      return [];
    }
  }

  async addAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString()
    };
    
    const announcements = await this.getAnnouncements();
    announcements.unshift(newAnnouncement);
    
    try {
      localStorage.setItem('announcements', JSON.stringify(announcements));
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
    
    return newAnnouncement;
  }

  // Utility methods
  generateId(): string {
    return Date.now().toString();
  }

  // Aggressive cleanup
  clearCache(): void {
    this.allMemoriesCache = null;
    this.loadedMemoryPages.clear();
    this.imageMetadataCache = null;
    this.singleImageCache.clear();
    this.activeRequests.clear();
    
    // Force garbage collection hint
    if (global?.gc) {
      global.gc();
    }
  }

  // Memory stats for debugging
  getMemoryStats(): any {
    return {
      memoryPages: this.loadedMemoryPages.size,
      cachedImages: this.singleImageCache.size,
      activeRequests: this.activeRequests.size,
      totalMemories: this.allMemoriesCache?.length || 0
    };
  }
}

export default new DataService();
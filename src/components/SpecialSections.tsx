import React, { useState, useEffect } from 'react';
import { Heart, Gift, Music, Scroll, Star, ChevronDown, ChevronUp } from 'lucide-react';
import dataService, { SpecialSections, DiaryConclusion, DiaryMetadata } from '../utils/dataService';
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableSection = ({ title, icon, children, defaultExpanded = false }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-xl p-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:text-purple-300 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpecialSectionsComponent: React.FC = () => {
  const [specialSections, setSpecialSections] = useState<SpecialSections | null>(null);
  const [diaryConclusion, setDiaryConclusion] = useState<DiaryConclusion | null>(null);
  const [diaryMetadata, setDiaryMetadata] = useState<DiaryMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpecialContent();
  }, []);

  const loadSpecialContent = async () => {
    try {
      setIsLoading(true);
      const [sections, conclusion, metadata] = await Promise.all([
        dataService.getSpecialSections(),
        dataService.getDiaryConclusion(),
        dataService.getDiaryMetadata()
      ]);
      
      setSpecialSections(sections);
      setDiaryConclusion(conclusion);
      setDiaryMetadata(metadata);
    } catch (error) {
      console.error('Error loading special content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!specialSections && !diaryConclusion) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Diary Metadata Header */}
      {diaryMetadata && (
        <div className="text-center mb-8 p-6 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-xl">
          <h1 className="text-3xl font-bold text-yellow-300 mb-2">{diaryMetadata.title}</h1>
          <p className="text-yellow-200">
            From {diaryMetadata.author} to {diaryMetadata.recipient} • {diaryMetadata.occasion}
          </p>
          <p className="text-yellow-200/80 text-sm mt-2">
            Created: {new Date(diaryMetadata.creation_date).toLocaleDateString()} • 
            Relationship since: {new Date(diaryMetadata.relationship_start).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Heartfelt Letter */}
      {specialSections?.heartfelt_letter && (
        <ExpandableSection 
          title={specialSections.heartfelt_letter.title}
          icon={<Scroll className="text-purple-400" size={24} />}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {specialSections.heartfelt_letter.key_themes.map((theme, index) => (
                <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                  {theme.replace('_', ' ')}
                </span>
              ))}
            </div>
            <div className="text-white/90 leading-relaxed whitespace-pre-line">
              {specialSections.heartfelt_letter.content}
            </div>
          </div>
        </ExpandableSection>
      )}

      {/* Promises */}
      {specialSections?.promises && specialSections.promises.length > 0 && (
        <ExpandableSection 
          title="Promises Made"
          icon={<Heart className="text-pink-400" size={24} />}
        >
          <div className="space-y-4">
            {specialSections.promises.map((promise, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Promise #{promise.promise_number}</h3>
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                    {promise.theme.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-white/80 leading-relaxed">{promise.content}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Thank You Section */}
      {specialSections?.thank_you_section && (
        <ExpandableSection 
          title={specialSections.thank_you_section.title}
          icon={<Gift className="text-green-400" size={24} />}
        >
          <div className="space-y-4">
            <div className="text-white/90 leading-relaxed mb-6">
              {specialSections.thank_you_section.content}
            </div>
            
            {specialSections.thank_you_section.key_gratitudes.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Key Gratitudes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {specialSections.thank_you_section.key_gratitudes.map((gratitude, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Star size={12} className="text-yellow-400" />
                      <span className="text-white/80 text-sm">{gratitude}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {specialSections.thank_you_section.gifts_mentioned.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Gifts Mentioned:</h4>
                <div className="flex flex-wrap gap-2">
                  {specialSections.thank_you_section.gifts_mentioned.map((gift, index) => (
                    <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                      {gift}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Song Dedication */}
      {specialSections?.song_dedication && (
        <ExpandableSection 
          title={specialSections.song_dedication.title}
          icon={<Music className="text-blue-400" size={24} />}
        >
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">
                "{specialSections.song_dedication.song_details.song_title}"
              </h4>
              <p className="text-white/80 mb-3">{specialSections.song_dedication.song_details.meaning_explanation}</p>
              <p className="text-white/90 font-medium">{specialSections.song_dedication.song_details.significance}</p>
            </div>
            
            {specialSections.song_dedication.lyrics_excerpt && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h5 className="text-white font-semibold mb-2">Lyrics:</h5>
                <p className="text-blue-200 italic">{specialSections.song_dedication.lyrics_excerpt}</p>
              </div>
            )}
            
            <p className="text-white/80">{specialSections.song_dedication.personal_message}</p>
          </div>
        </ExpandableSection>
      )}

      {/* Final Birthday Wish */}
      {specialSections?.final_birthday_wish && (
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">🎉 Birthday Wish 🎉</h2>
          <p className="text-yellow-200 text-lg">{specialSections.final_birthday_wish.message}</p>
          <p className="text-yellow-200/80 mt-2">{specialSections.final_birthday_wish.wishes}</p>
        </div>
      )}

      {/* Diary Conclusion */}
      {diaryConclusion && (
        <ExpandableSection 
          title="Final Thoughts"
          icon={<Heart className="text-red-400" size={24} />}
        >
          <div className="space-y-6">
            {Object.entries(diaryConclusion).map(([key, value], index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                  {key.replace('_', ' ')}
                </h4>
                <p className="text-white/90 leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
};

export default SpecialSectionsComponent; 
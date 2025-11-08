import React, { useState, useCallback } from 'react';
import { getInspirationalArt } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { ImageIcon } from '../Icons';
import { FeedbackComponent } from '../FeedbackComponent'; // Import FeedbackComponent

const themes = ['hope', 'peace', 'strength', 'faith', 'love', 'courage', 'forgiveness'];

export const InspirationalArt: React.FC = () => {
  const [art, setArt] = useState<{ verse: string, imageUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');
  const [artContentId, setArtContentId] = useState<string | null>(null); // To uniquely identify the art for feedback

  const fetchArt = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setArt(null);
    setArtContentId(null); // Reset content ID
    try {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      setCurrentTheme(randomTheme);
      const result = await getInspirationalArt(randomTheme);
      setArt(result);
      setArtContentId(`${randomTheme}-${Date.now().toString()}`); // Set a unique ID
    } catch (e) {
      setError('Failed to generate inspirational art. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch art on initial component load
  React.useEffect(() => {
    fetchArt();
  }, [fetchArt]);

  const handleFeedbackSubmit = useCallback((contentId: string, feedback: 'positive' | 'negative') => {
    console.log(`Inspirational Art Feedback for ${contentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
      <div className="flex justify-center items-center mb-4">
        <ImageIcon />
        <h2 className="text-xl font-semibold ml-2">Inspirational Art</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed">Discover uplifting verses paired with beautiful, AI-generated art to inspire your day.</p>
      
      <button
        onClick={fetchArt}
        disabled={isLoading}
        className="bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 inline-flex items-center shadow hover:shadow-md transform hover:-translate-y-px"
      >
        {isLoading ? <Spinner size="sm" /> : 'Generate New Inspiration'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-96 bg-slate-100 rounded-lg">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-600">Creating a piece about {currentTheme}...</p>
          </div>
        )}
        {art && (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg inline-block">
            <img src={art.imageUrl} alt="Inspirational art" className="rounded-lg shadow-lg max-w-full h-auto" />
            <blockquote className="mt-4 text-lg text-slate-800 italic">"{art.verse}"</blockquote>
            {artContentId && (
              <FeedbackComponent contentId={`inspirational-art-${artContentId}`} onFeedbackSubmit={handleFeedbackSubmit} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
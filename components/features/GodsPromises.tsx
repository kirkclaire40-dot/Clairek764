import React, { useState, useCallback } from 'react';
import { getGodsPromises } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { ScrollIcon } from '../Icons';
import ReactMarkdown from 'react-markdown';
import { FeedbackComponent } from '../FeedbackComponent';

interface PromiseResult {
  verses: string[];
  reflection: string;
  relatedTopics: string[]; // Added new property
}

export const GodsPromises: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<PromiseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]); // New state for suggested topics

  const handleSubmit = async (e: React.FormEvent | null, searchTopic?: string) => {
    e?.preventDefault();
    const currentTopic = searchTopic || topic;

    if (!currentTopic.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    setContentId(null);
    setSuggestedTopics([]); // Clear previous suggestions

    try {
      const apiResult = await getGodsPromises(currentTopic);
      setResult(apiResult);
      setContentId(`gods-promises-${Date.now().toString()}`); // Unique ID for feedback
      setSuggestedTopics(apiResult.relatedTopics); // Set suggested topics from API response
      if (!searchTopic) { // Only clear input if it was a user-typed search, not a suggested topic click
        setTopic(''); 
      }
    } catch (e) {
      setError('Failed to retrieve God\'s promises. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedTopicClick = (suggested: string) => {
    setTopic(suggested); // Set the input field to the suggested topic
    handleSubmit(null, suggested); // Trigger a new search with the suggested topic
  };

  const handleFeedbackSubmit = useCallback((feedbackContentId: string, feedback: 'positive' | 'negative') => {
    console.log(`God's Promises Feedback for ${feedbackContentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-center items-center mb-4">
        <ScrollIcon />
        <h2 className="text-xl font-semibold ml-2">God's Promises in Scripture</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed text-center">
        Enter a topic (e.g., "healing", "peace", "provision") to discover relevant Bible verses and a comforting reflection on God's promises.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'strength in adversity' or 'finding joy'"
            className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px"
          >
            {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Searching...</span></> : 'Search Promises'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {isLoading && (
        <div className="mt-6 flex justify-center">
            <div className="text-center">
                <Spinner size="lg"/>
                <p className="mt-2 text-slate-600">Searching for divine assurances...</p>
            </div>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-amber-50/70 border border-amber-200/80 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-amber-800">Divine Promises on {result.relatedTopics.length > 0 ? topic : ''}</h3>
          
          <div className="mb-4 space-y-2">
            {result.verses.map((verse, index) => (
              <p key={index} className="text-slate-800 italic">"{verse}"</p>
            ))}
          </div>
          
          <h4 className="font-semibold text-slate-700 mt-5 mb-2">Reflection:</h4>
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{result.reflection}</ReactMarkdown>
          </div>
          {contentId && (
            <FeedbackComponent contentId={contentId} onFeedbackSubmit={handleFeedbackSubmit} />
          )}

          {suggestedTopics.length > 0 && (
            <div className="mt-6 pt-4 border-t border-amber-200">
              <h4 className="font-semibold text-slate-700 mb-2">Explore More:</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((suggested, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedTopicClick(suggested)}
                    className="bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
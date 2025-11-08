import React, { useState, useEffect, useCallback } from 'react';
import { getDailyBibleReading } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { BibleIcon } from '../Icons';
import ReactMarkdown from 'react-markdown';

interface DailyReading {
  chapter: string;
  verse: string;
  reflection: string;
}

export const DailyBibleReading: React.FC = () => {
  const [reading, setReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  const fetchReading = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setReading(null);
    setCopyFeedback('');
    try {
      const result = await getDailyBibleReading();
      setReading(result);
    } catch (e) {
      setError('Failed to fetch today\'s Bible reading. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

  const displayReference = reading ? `${reading.chapter}${reading.verse ? `: ${reading.verse}` : ''}` : '';

  const handleCopyReference = () => {
    if (displayReference) {
      navigator.clipboard.writeText(displayReference);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000); // Clear feedback after 2 seconds
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
      <div className="flex justify-center items-center mb-4">
        <BibleIcon />
        <h2 className="text-xl font-semibold ml-2">Daily Bible Reading</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed">
        Start your day with spiritual nourishment. Discover a fresh scripture passage and a thoughtful reflection to guide your walk with God.
      </p>
      
      <button
        onClick={fetchReading}
        disabled={isLoading}
        className="bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 inline-flex items-center shadow hover:shadow-md transform hover:-translate-y-px"
      >
        {isLoading ? <Spinner size="sm" /> : 'Get Today\'s Reading'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {reading && (
        <div className="mt-8 p-4 bg-teal-50 border-l-4 border-teal-500 text-left rounded-r-lg">
          <h3 className="text-lg font-semibold text-teal-800 mb-2">{displayReference}</h3>
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{reading.reflection}</ReactMarkdown>
          </div>
          
          <div className="mt-6 pt-4 border-t border-teal-200">
            <p className="text-slate-700 text-base mb-3">
              Want to dive deeper into today's reading? Use the <strong className="text-teal-700">Deep Study Assistant</strong> to explore its meaning, historical context, or practical applications!
            </p>
            <button
              onClick={handleCopyReference}
              className="bg-teal-500 text-white font-semibold py-2 px-5 rounded-full hover:bg-teal-600 transition-colors duration-300 inline-flex items-center text-sm shadow hover:shadow-md"
              aria-label="Copy Bible reference"
            >
              Copy Reference to Clipboard
            </button>
            {copyFeedback && <span className="ml-3 text-sm text-teal-600 font-medium">{copyFeedback}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { getQuickVerse } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { SparklesIcon } from '../Icons';

export const VerseOfTheDay: React.FC = () => {
  const [verse, setVerse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVerse = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setVerse('');
    try {
      const prompt = "Give me a single, powerful and encouraging bible promise. Just the verse text and reference, nothing else.";
      const result = await getQuickVerse(prompt);
      setVerse(result);
    } catch (e) {
      setError('Failed to fetch a verse. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
      <div className="flex justify-center items-center mb-4">
        <SparklesIcon />
        <h2 className="text-xl font-semibold ml-2">Verse for the Moment</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed">Click the button below to receive a quick, uplifting promise to brighten your moment.</p>
      
      <button
        onClick={fetchVerse}
        disabled={isLoading}
        className="bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 inline-flex items-center shadow hover:shadow-md transform hover:-translate-y-px"
      >
        {isLoading ? <Spinner size="sm" /> : 'Receive a Promise'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {verse && (
        <div className="mt-8 p-4 bg-teal-50 border-l-4 border-teal-500 text-left rounded-r-lg">
          <blockquote className="text-lg text-slate-800 italic">"{verse.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}"</blockquote>
        </div>
      )}
    </div>
  );
};
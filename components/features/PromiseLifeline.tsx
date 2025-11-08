import React, { useState, useCallback } from 'react';
import { getPromiseLifeline } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { LifelineIcon } from '../Icons';
import { FeedbackComponent } from '../FeedbackComponent';

const challenges = [
  "Feeling Anxious",
  "Facing Uncertainty",
  "Needing Strength",
  "Feeling Overwhelmed",
  "Struggling with Forgiveness",
  "Needing Guidance",
  "Feeling Discouraged",
  "Grieving a Loss",
];

interface LifelineData {
  verse: string;
  reflection: string;
  declaration: string;
  action: string;
}

export const PromiseLifeline: React.FC = () => {
  const [lifeline, setLifeline] = useState<LifelineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);

  const handleChallengeSelect = useCallback(async (challenge: string) => {
    setIsLoading(true);
    setError('');
    setLifeline(null);
    setSelectedChallenge(challenge);
    setContentId(null);

    try {
      const result = await getPromiseLifeline(challenge);
      setLifeline(result);
      setContentId(`lifeline-${challenge.replace(/\s+/g, '-')}-${Date.now()}`);
    } catch (e) {
      setError('Could not fetch a lifeline at this moment. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFeedbackSubmit = useCallback((feedbackContentId: string, feedback: 'positive' | 'negative') => {
    console.log(`Promise Lifeline Feedback for ${feedbackContentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);

  const renderInitialState = () => (
    <>
      <p className="text-slate-600 mb-6 leading-relaxed text-center">
        When you're facing a tough moment, grab onto a promise. Select a challenge below to receive immediate encouragement and a practical step forward.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {challenges.map((challenge) => (
          <button
            key={challenge}
            onClick={() => handleChallengeSelect(challenge)}
            className="p-4 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-lg transition-colors duration-300 shadow-sm hover:shadow-md text-center h-full"
          >
            {challenge}
          </button>
        ))}
      </div>
    </>
  );

  const renderResult = () => (
    <div className="text-left space-y-6 mt-6">
      <h3 className="text-xl font-semibold text-center text-slate-700">A Lifeline for: {selectedChallenge}</h3>
      
      <div className="animate-fade-in p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
        <h4 className="font-bold text-amber-800">Your Promise</h4>
        <p className="text-lg text-slate-800 italic mt-1">"{lifeline?.verse}"</p>
      </div>

      <div className="animate-fade-in-delay-1 p-4 bg-sky-50 border-l-4 border-sky-400 rounded-r-lg">
        <h4 className="font-bold text-sky-800">Reflection</h4>
        <p className="text-slate-800 mt-1">{lifeline?.reflection}</p>
      </div>

      <div className="animate-fade-in-delay-2 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
        <h4 className="font-bold text-emerald-800">Your Declaration</h4>
        <p className="text-slate-800 font-semibold mt-1">{lifeline?.declaration}</p>
      </div>

      <div className="animate-fade-in-delay-3 p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-lg">
        <h4 className="font-bold text-rose-800">Your Next Step</h4>
        <p className="text-slate-800 mt-1">{lifeline?.action}</p>
      </div>
      
      {contentId && (
        <FeedbackComponent contentId={contentId} onFeedbackSubmit={handleFeedbackSubmit} />
      )}

      <div className="text-center pt-4">
        <button onClick={() => { setLifeline(null); setSelectedChallenge(''); }} className="bg-slate-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-slate-600 transition-colors">
            Choose Another Challenge
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <div className="flex justify-center items-center mb-4">
        <LifelineIcon />
        <h2 className="text-2xl font-semibold ml-2">Promise Lifeline</h2>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Finding the perfect promise for you...</p>
        </div>
      )}

      {!isLoading && error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {!isLoading && !error && (lifeline ? renderResult() : renderInitialState())}
    </div>
  );
};

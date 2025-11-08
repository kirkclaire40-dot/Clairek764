import React, { useState } from 'react';
import { getPersonalizedPlan } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import ReactMarkdown from 'react-markdown';

export const PersonalizedPlan: React.FC = () => {
  const [topic, setTopic] = useState('patience and forgiveness');
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setPlan('');
    try {
      const result = await getPersonalizedPlan(topic);
      setPlan(result);
    } catch (e) {
      setError('An error occurred while generating your plan. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Personalized Growth Plan</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Describe an area you'd like to grow in, and we'll generate a 7-day plan with scriptures, reflections, and actionable steps to help you on your journey.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'overcoming anxiety', 'finding my purpose'"
            className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !topic.trim()} className="bg-teal-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-colors duration-300 flex items-center justify-center shadow hover:shadow-md">
            {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Generating...</span></> : 'Generate Plan'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {isLoading && (
        <div className="mt-6 flex justify-center">
            <div className="text-center">
                <Spinner size="lg"/>
                <p className="mt-2 text-slate-600">Generating your personalized plan...</p>
            </div>
        </div>
      )}

      {plan && (
        <div className="mt-6 p-6 bg-slate-50/70 border border-slate-200/80 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your 7-Day Plan to Cultivate {topic}</h3>
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { submitPrayerRequest } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { HandsPrayingIcon } from '../Icons'; // Use the new icon
import ReactMarkdown from 'react-markdown';
import { FeedbackComponent } from '../FeedbackComponent';

export const PrayerRequestSupport: React.FC = () => {
  const [request, setRequest] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    setContentId(null);

    try {
      const aiResponse = await submitPrayerRequest(request);
      setResponse(aiResponse);
      setContentId(`prayer-request-${Date.now().toString()}`); // Unique ID for feedback
      setRequest(''); // Clear the input after submission
    } catch (e) {
      setError('Failed to send prayer request. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = useCallback((feedbackContentId: string, feedback: 'positive' | 'negative') => {
    console.log(`Prayer Request Feedback for ${feedbackContentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <div className="flex justify-center items-center mb-4">
        <HandsPrayingIcon />
        <h2 className="text-xl font-semibold ml-2">Prayer Request &amp; Support</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed text-center">
        Share your burdens and hopes, and receive a comforting, AI-generated response inspired by faith.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Type your prayer request here..."
          className="w-full p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !request.trim()}
          className="mt-4 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px mx-auto"
        >
          {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Sending Prayer...</span></> : 'Submit Prayer Request'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {response && (
        <div className="mt-6 p-6 bg-amber-50/70 border border-amber-200/80 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-amber-800">A Message of Encouragement:</h3>
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{response}</ReactMarkdown>
          </div>
          {contentId && (
            <FeedbackComponent contentId={contentId} onFeedbackSubmit={handleFeedbackSubmit} />
          )}
        </div>
      )}
    </div>
  );
};
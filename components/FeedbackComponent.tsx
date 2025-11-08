import React, { useState } from 'react';

interface FeedbackComponentProps {
  contentId: string; // A unique identifier for the content being reviewed
  onFeedbackSubmit: (contentId: string, feedback: 'positive' | 'negative') => void;
}

export const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ contentId, onFeedbackSubmit }) => {
  const [submittedFeedback, setSubmittedFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    setSubmittedFeedback(feedback);
    onFeedbackSubmit(contentId, feedback);
  };

  if (submittedFeedback) {
    return (
      <div className="flex items-center text-sm text-slate-500 mt-4 justify-center md:justify-start">
        <span role="img" aria-label="Thank you for your feedback" className="mr-2">
          {submittedFeedback === 'positive' ? '👍' : '👎'}
        </span>
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-4 text-slate-600 justify-center md:justify-start">
      <span className="text-sm">Was this helpful?</span>
      <button
        onClick={() => handleFeedback('positive')}
        className="p-2 rounded-full hover:bg-slate-200 transition-colors flex items-center"
        aria-label="Content is helpful"
      >
        <span role="img" aria-label="Thumbs up">👍</span>
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className="p-2 rounded-full hover:bg-slate-200 transition-colors flex items-center"
        aria-label="Content is not helpful"
      >
        <span role="img" aria-label="Thumbs down">👎</span>
      </button>
    </div>
  );
};

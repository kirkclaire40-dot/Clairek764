import React, { useState, useEffect } from 'react';
import { getGroundedResponse } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { LinkIcon } from '../Icons';
import ReactMarkdown from 'react-markdown';

export const GroundingSearch: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [useMaps, setUseMaps] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (useMaps && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError('');
        },
        (err) => {
          setLocationError('Could not get location. Please enable location services in your browser.');
          console.error(err);
          setUseMaps(false);
        }
      );
    }
  }, [useMaps, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    if (useMaps && !location) {
        setError("Location is required for map search but is not available.");
        return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await getGroundedResponse(prompt, useMaps, location ?? undefined);
      setResult(response);
    } catch (e) {
      setError('The search could not be completed. Please check your connection and try again.');
      console.error("Grounding Search API error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Explore & Discover</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Ask about historical context, theological concepts, or find places like churches or community centers near you.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'History of the Dead Sea Scrolls' or 'Churches near me'"
          className="w-full p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
          disabled={isLoading}
        />
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="useMaps"
            checked={useMaps}
            onChange={(e) => setUseMaps(e.target.checked)}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="useMaps" className="ml-2 block text-sm text-slate-800">
            Include local map results (requires location)
          </label>
        </div>
        {locationError && <p className="text-red-500 text-sm mt-2">{locationError}</p>}
        <button type="submit" disabled={isLoading || !prompt.trim()} className="mt-4 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px">
          {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Searching...</span></> : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 p-6 bg-slate-50/70 border border-slate-200/80 rounded-lg">
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{result.text}</ReactMarkdown>
          </div>
          {result.sources && result.sources.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-700">Sources:</h4>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                {result.sources.map((source, index) => {
                  const chunk = source.web || source.maps;
                  if (!chunk || !chunk.uri) return null;
                  return (
                    <li key={index} className="truncate">
                      <a href={chunk.uri} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                        <LinkIcon />
                        {chunk.title || chunk.uri}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
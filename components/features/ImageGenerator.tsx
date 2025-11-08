import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import { Spinner } from '../Spinner';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setImage('');
    try {
      const result = await generateImage(prompt, aspectRatio);
      setImage(result);
    } catch (e) {
      setError('Failed to generate image. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Visualize Promises</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Describe a scene, a concept, or a feeling related to a promise, and watch it come to life.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'A lighthouse in a storm, shining brightly'"
            className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          >
            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
          </select>
        </div>
        <button type="submit" disabled={isLoading || !prompt.trim()} className="mt-4 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px">
          {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Generating...</span></> : 'Generate Image'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center items-center h-64 bg-slate-100 rounded-lg">
            <Spinner size="lg" />
          </div>
        )}
        {image && (
          <div className="flex justify-center">
            <img src={image} alt={prompt} className="rounded-lg shadow-lg max-w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};
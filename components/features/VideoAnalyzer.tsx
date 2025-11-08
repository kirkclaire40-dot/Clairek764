import React, { useState } from 'react';
import { analyzeVideoContent } from '../../services/geminiService';
import { Spinner } from '../Spinner';

export const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis('');
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile || !prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      // NOTE: This is a simulated call. 
      // See geminiService.ts for implementation details.
      const result = await analyzeVideoContent(videoFile, prompt);
      setAnalysis(result);
    } catch (e) {
      setError('Failed to analyze video. This is a simulated feature.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Reflect on Video</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Upload a short video and ask for insights or reflections. 
        <br/>
        <strong className="font-semibold text-orange-600">Note:</strong> Direct video analysis from the browser is not yet supported by the Gemini SDK. This feature is a demonstration of the UI and potential capabilities.
      </p>

      <input type="file" accept="video/*" onChange={handleVideoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200" />
      
      {videoFile && (
        <div className="mt-6">
          <div className="flex justify-center mb-4">
            <video src={videoUrl} controls className="rounded-lg shadow-md max-w-md w-full" />
          </div>

          <div className="mt-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'What spiritual themes are present in this video?'"
              className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            />
            <div className="flex mt-2">
              <button onClick={handleAnalyze} disabled={isLoading || !prompt.trim()} className="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors duration-300 flex items-center justify-center shadow hover:shadow-md">
                {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Analyzing...</span></> : 'Analyze Video'}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
          
          {analysis && (
            <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
              <h4 className="font-semibold text-emerald-800">Analysis:</h4>
              <p className="text-slate-800 whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { analyzeImage, editImage } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { blobToBase64 } from '../../lib/utils';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File, url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<'analyze' | 'edit' | null>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage('');
      setAnalysis('');
      setError('');
    }
  };

  const handleTask = async (task: 'analyze' | 'edit') => {
    if (!originalImage || !prompt.trim()) return;

    setIsLoading(true);
    setActiveTask(task);
    setError('');
    setEditedImage('');
    setAnalysis('');

    try {
      const base64Data = await blobToBase64(originalImage.file);
      if (task === 'analyze') {
        const result = await analyzeImage(base64Data, originalImage.file.type, prompt);
        setAnalysis(result);
      } else {
        const result = await editImage(base64Data, originalImage.file.type, prompt);
        setEditedImage(result);
      }
    } catch (e) {
      setError(`Failed to ${task} image. Please try again.`);
      console.error(e);
    } finally {
      setIsLoading(false);
      setActiveTask(null);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Create Inspirational Art</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Upload a photo, then describe what you'd like to analyze or change. For example, "What promise does this image remind you of?" or "Add a golden light."
      </p>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200"/>
      
      {originalImage && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Original</h3>
              <img src={originalImage.url} alt="Original" className="rounded-lg shadow-md w-full" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Result</h3>
              <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                {isLoading && activeTask === 'edit' && <Spinner size="lg" />}
                {!isLoading && editedImage && <img src={editedImage} alt="Edited" className="rounded-lg shadow-md w-full" />}
                {!isLoading && !editedImage && <p className="text-slate-500">Your edited image will appear here.</p>}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt..."
              className="w-full p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
              disabled={isLoading}
            />
            <div className="flex gap-4 mt-2">
              <button onClick={() => handleTask('analyze')} disabled={isLoading || !prompt.trim()} className="bg-sky-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-sky-700 disabled:bg-sky-300 transition-colors duration-300 flex items-center justify-center shadow hover:shadow-md">
                {isLoading && activeTask === 'analyze' ? <><Spinner size="sm" /> <span className="ml-2">Analyzing...</span></> : 'Analyze'}
              </button>
              <button onClick={() => handleTask('edit')} disabled={isLoading || !prompt.trim()} className="bg-violet-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-violet-700 disabled:bg-violet-300 transition-colors duration-300 flex items-center justify-center shadow hover:shadow-md">
                 {isLoading && activeTask === 'edit' ? <><Spinner size="sm" /> <span className="ml-2">Editing...</span></> : 'Edit Image'}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
          
          {isLoading && activeTask === 'analyze' && <div className="mt-4"><Spinner /></div>}
          
          {analysis && (
            <div className="mt-4 p-4 bg-sky-50 border-l-4 border-sky-400 rounded-r-lg">
              <h4 className="font-semibold text-sky-800">Analysis:</h4>
              <p className="text-slate-800">{analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
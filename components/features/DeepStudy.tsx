import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getDeepStudyAnalysis } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { textToSpeech } from '../../services/geminiService';
import { PlayIcon, StopIcon } from '../Icons';
import ReactMarkdown from 'react-markdown';
import { FeedbackComponent } from '../FeedbackComponent';


export const DeepStudy: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // New state to track if audio is playing
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null); // Ref for the audio source
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  // Initialize AudioContext once on mount and clean up on unmount
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      // Stop any playing audio and close the context on unmount
      audioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResult('');
    setAnalysisId(null);
    // Stop any currently playing audio before starting new analysis
    audioSourceRef.current?.stop();
    setIsAudioPlaying(false);
    audioSourceRef.current = null;

    try {
      const analysis = await getDeepStudyAnalysis(prompt);
      setResult(analysis);
      setAnalysisId(Date.now().toString());
    } catch (e) {
      setError("Sorry, I couldn't complete the analysis. There might be a connection issue. Please try again in a moment.");
      console.error("Deep Study API error:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
   const handlePlayAudio = async (text: string) => {
    if (!audioContextRef.current) {
      setError("Audio context not initialized.");
      return;
    }

    if (isAudioPlaying) {
        audioSourceRef.current?.stop(); // Stop current audio if playing
        audioSourceRef.current = null;
        setIsAudioPlaying(false);
        return;
    }
    try {
        const audioBuffer = await textToSpeech(text);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          audioSourceRef.current = null;
          setIsAudioPlaying(false);
        };
        
        source.start();
        audioSourceRef.current = source;
        setIsAudioPlaying(true);
    } catch (e) {
        console.error("TTS Error:", e);
        setError("Sorry, I couldn't generate audio for that message.");
        setIsAudioPlaying(false);
    }
  };

  const handleFeedbackSubmit = useCallback((contentId: string, feedback: 'positive' | 'negative') => {
    console.log(`Deep Study Feedback for ${contentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);


  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Deep Study Assistant</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Enter a complex topic, scripture, or question for a thoughtful, in-depth analysis. 
        For example: "Provide a detailed exegesis of Romans 8," or "Draft a sermon outline on the topic of grace."
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your topic here..."
          className="w-full p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()} className="mt-4 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px">
          {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Analyzing...</span></> : 'Analyze'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 p-6 bg-slate-50/70 border border-slate-200/80 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
          <div className="prose max-w-none text-slate-800">
             <ReactMarkdown>{result}</ReactMarkdown>
          </div>
           <button 
             onClick={() => handlePlayAudio(result)} 
             className="mt-4 text-teal-600 hover:text-teal-700 flex items-center font-medium"
             aria-label={isAudioPlaying ? "Stop audio playback" : "Read aloud the analysis result"}
           >
               {isAudioPlaying ? <><StopIcon/> <span className="ml-1">Stop Audio</span></> : <><PlayIcon/> <span className="ml-1">Read Aloud</span></>}
            </button>
            {analysisId && (
              <FeedbackComponent contentId={`deep-study-${analysisId}`} onFeedbackSubmit={handleFeedbackSubmit} />
            )}
        </div>
      )}
    </div>
  );
};
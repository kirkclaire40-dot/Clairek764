import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../../types';
import { createChat } from '../../services/geminiService';
import { Spinner } from '../Spinner';
// Fix: Aliased the imported 'Chat' type to 'GeminiChat' to resolve name conflict with the component.
import type { Chat as GeminiChat } from '@google/genai';
import { textToSpeech } from '../../services/geminiService';
import { PlayIcon, StopIcon } from '../Icons';
import { FeedbackComponent } from '../FeedbackComponent'; // Import FeedbackComponent

export const Chat: React.FC = () => {
  const [chat, setChat] = useState<GeminiChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audio, setAudio] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChat());
    setMessages([{ role: 'model', text: 'Hello! I am Kairos, your faith companion. How can I encourage you today?' }]);
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
        audio?.stop();
        audioContextRef.current?.close();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePlayAudio = async (text: string) => {
    if (audio) {
        audio.stop();
        setAudio(null);
        return;
    }
    try {
        const audioBuffer = await textToSpeech(text);
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current!.destination);
        source.start();
        source.onended = () => setAudio(null);
        setAudio(source);
    } catch (e) {
        console.error("TTS Error:", e);
        setError("Sorry, I couldn't generate audio for that message.");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const currentInput = input;
    const userMessage: ChatMessage = { role: 'user', text: currentInput };
    // Add user message and a placeholder for the model's streaming response
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const stream = await chat.sendMessageStream({ message: currentInput });
      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        // Update the last message (the model's response) with the streamed content
        setMessages(prev => {
          const newMessages = [...prev.slice(0, -1)];
          newMessages.push({ ...prev[prev.length - 1], text: fullResponse });
          return newMessages;
        });
      }
    } catch (e) {
      console.error("Chat API error:", e);
      let errorMessage = "I'm having trouble connecting right now. Please try sending your message again.";

      if (!navigator.onLine) {
        errorMessage = "It seems you're offline. Please check your internet connection and try again.";
      } else if (e instanceof Error) {
        const lowerCaseMessage = e.message.toLowerCase();
        if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('rate limit')) {
          errorMessage = "I'm experiencing a high volume of requests right now. Please wait a moment and try again.";
        } else if (lowerCaseMessage.includes('api key')) {
           errorMessage = "There seems to be an issue with the application's configuration. Please try again later.";
        } else {
           errorMessage = "Sorry, an unexpected error occurred while trying to reach me. Please try sending your message again in a little bit.";
        }
      }
      
      setMessages(prev => {
        const newMessages = [...prev.slice(0, -1)];
        newMessages.push({ ...prev[prev.length - 1], text: errorMessage });
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = useCallback((contentId: string, feedback: 'positive' | 'negative') => {
    console.log(`Chat Feedback for ${contentId}: ${feedback}`);
    // In a real app, send this feedback to an analytics or feedback API
  }, []);
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl max-w-2xl mx-auto flex flex-col h-[70vh]">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex my-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-xs lg:max-w-md shadow-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="whitespace-pre-wrap">{msg.text || ' '}</p>
              {msg.role === 'model' && !isLoading && msg.text && (
                <>
                  <button onClick={() => handlePlayAudio(msg.text)} className="mt-2 text-slate-500 hover:text-slate-800">
                      {audio ? <StopIcon/> : <PlayIcon/>}
                  </button>
                  {/* Only show feedback for the latest model message */}
                  {index === messages.length - 1 && (
                    <FeedbackComponent contentId={`chat-message-${index}`} onFeedbackSubmit={handleFeedbackSubmit} />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-center text-sm pb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for encouragement..."
            className="flex-1 p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="bg-teal-600 text-white p-2 rounded-r-lg hover:bg-teal-700 disabled:bg-teal-300">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
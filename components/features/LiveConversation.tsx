import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Changed import from 'connectLive' to 'connectLiveSession' as per updated geminiService.ts.
import { connectLiveSession } from '../../services/geminiService';
import { Spinner } from '../Spinner';
// Fix: Changed `import type` to `import` for `Modality` to allow its use as a value.
import { LiveServerMessage, Blob, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from '../../lib/audioUtils';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export const LiveConversation: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState<string>('');
    const [conversationHistory, setConversationHistory] = useState<{user: string, model: string}[]>([]);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);

    const cleanup = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        outputSourcesRef.current.forEach(source => source.stop());
        outputSourcesRef.current.clear();

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
    }, []);

    const startConversation = async () => {
        if (connectionState !== 'disconnected' && connectionState !== 'error') return;
        setConnectionState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            // Fix: Call the new connectLiveSession function from geminiService.
            // Ensure the model name is passed as the first argument, and callbacks/config are correctly structured.
            sessionPromiseRef.current = connectLiveSession(
                'gemini-2.5-flash-native-audio-preview-09-2025', // Model name
                { // params object
                    callbacks: {
                        onopen: () => {
                            setConnectionState('connected');
                            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
                            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
                                sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };
                            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription) {
                                setUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
                            }
                            if (message.serverContent?.outputTranscription) {
                                setModelTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
                            }
                            if (message.serverContent?.turnComplete) {
                                setConversationHistory(prev => [...prev, {user: userTranscript, model: modelTranscript}]);
                                setUserTranscript('');
                                setModelTranscript('');
                            }

                            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (base64Audio && outputAudioContextRef.current) {
                                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                                 const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                                 const source = outputAudioContextRef.current.createBufferSource();
                                 source.buffer = audioBuffer;
                                 source.connect(outputAudioContextRef.current.destination);
                                 source.start(nextStartTimeRef.current);
                                 nextStartTimeRef.current += audioBuffer.duration;
                                 outputSourcesRef.current.add(source);
                                 source.onended = () => outputSourcesRef.current.delete(source);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Live connection error:', e);
                            setConnectionState('error');
                            cleanup();
                        },
                        onclose: () => {
                            setConnectionState('disconnected');
                            cleanup();
                        }
                    }, // end callbacks
                    config: { // config object
                        responseModalities: [Modality.AUDIO], // Must be an array with a single `Modality.AUDIO` element.
                        speechConfig: {
                            // Other available voice names are `Puck`, `Charon`, `Kore`, and `Fenrir`.
                            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
                        },
                        // Updated system instruction to be consistent with the app's theme
                        systemInstruction: 'You are a friendly, empathetic, and wise spiritual companion.',
                        outputAudioTranscription: {}, // Enable transcription for model output audio.
                        inputAudioTranscription: {}, // Enable transcription for user input audio.
                    }, // end config
                } // end params object
            );

        } catch (err) {
            console.error("Failed to start conversation:", err);
            setConnectionState('error');
            cleanup();
        }
    };
    
    const stopConversation = () => {
        cleanup();
        setConnectionState('disconnected');
    };

    useEffect(() => {
      // Ensure cleanup runs when component unmounts
      return cleanup;
    }, [cleanup]);

    const getButton = () => {
        switch (connectionState) {
            case 'connecting':
                return <button disabled className="bg-amber-500 text-white font-bold py-4 px-8 rounded-full flex items-center shadow-md"><Spinner />Connecting...</button>;
            case 'connected':
                return <button onClick={stopConversation} className="bg-rose-500 text-white font-bold py-4 px-8 rounded-full hover:bg-rose-600 shadow-md transition-colors">Stop Conversation</button>;
            case 'disconnected':
            case 'error':
                return <button onClick={startConversation} className="bg-emerald-500 text-white font-bold py-4 px-8 rounded-full hover:bg-emerald-600 shadow-md transition-colors">Start Conversation</button>;
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-2 text-center">Voice Companion</h2>
            <p className="text-slate-600 mb-6 text-center leading-relaxed">
                {connectionState === 'connected' ? "I'm listening. Speak and I will respond." : "Click start to have a real-time conversation."}
            </p>
            <div className="flex justify-center mb-6">
                {getButton()}
            </div>
            {connectionState === 'error' && <p className="text-red-500 text-center">Connection failed. Please check permissions and try again.</p>}
            
            {connectionState === 'connected' && (
                <div className="mt-4 p-4 border border-slate-200/80 rounded-lg bg-slate-50/70 h-64 overflow-y-auto">
                    {conversationHistory.map((turn, index) => (
                        <div key={index}>
                            <p><strong>You:</strong> {turn.user}</p>
                            <p><strong>Companion:</strong> {turn.model}</p>
                            <hr className="my-2"/>
                        </div>
                    ))}
                    {userTranscript && <p><strong>You:</strong> <span className="text-slate-500">{userTranscript}</span></p>}
                    {modelTranscript && <p><strong>Companion:</strong> <span className="text-slate-500">{modelTranscript}</span></p>}
                </div>
            )}
        </div>
    );
};
import React, { useState } from 'react';
import { generateVideo } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { blobToBase64 } from '../../lib/utils';
import { useApiKey } from '../../hooks/useApiKey';

const aspectRatios = ['16:9', '9:16'] as const;
type AspectRatio = typeof aspectRatios[number];

const loadingMessages = [
    "Crafting your visual story...",
    "Rendering pixels of promise...",
    "This can take a few minutes, thank you for your patience.",
    "Composing a masterpiece for you...",
    "Just a little longer, the vision is coming to life."
];

export const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [image, setImage] = useState<{ file: File, url: string } | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    
    const { hasApiKey, isChecking, selectApiKey, resetApiKey } = useApiKey();

    React.useEffect(() => {
        // Fix: Changed NodeJS.Timeout to number for browser compatibility.
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage({ file, url: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() && !image || isLoading) return;
        if (!hasApiKey) {
            setError("Please select an API key to generate videos.");
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl('');
        setLoadingMessage(loadingMessages[0]);
        
        try {
            let imagePayload: { data: string, mimeType: string } | undefined;
            if (image) {
                const base64Data = await blobToBase64(image.file);
                imagePayload = { data: base64Data, mimeType: image.file.type };
            }
            const url = await generateVideo(prompt, aspectRatio, imagePayload);
            setVideoUrl(url);
        } catch (e: any) {
            let errorMessage = 'Failed to generate video. Please try again.';
            if (e.message && e.message.includes("Requested entity was not found.")) {
                errorMessage = "Your API key is invalid or missing permissions. Please select a valid key.";
                resetApiKey();
            }
            setError(errorMessage);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return <div className="flex justify-center items-center"><Spinner /></div>;
    }

    if (!hasApiKey) {
        return (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
                <h2 className="text-xl font-semibold mb-2">API Key Required for Video Generation</h2>
                <p className="text-slate-600 mb-4 leading-relaxed">
                    Video generation with Veo requires a project with billing enabled. Please select your API key to continue.
                    You can find more information on billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.
                </p>
                <button onClick={selectApiKey} className="bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 shadow hover:shadow-md">
                    Select API Key
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Animate Your Faith</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
                Bring scripture and spiritual concepts to life. Describe a scene or upload a starting image to create a short video.
            </p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A vibrant sunrise over a peaceful valley'"
                    className="w-full p-3 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"
                    disabled={isLoading}
                />
                <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Starting Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200"/>
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-700 mb-1">Aspect Ratio</label>
                        <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            disabled={isLoading}
                        >
                            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                    </div>
                </div>
                {image && <img src={image.url} alt="Preview" className="mt-4 h-24 w-auto rounded"/>}
                <button type="submit" disabled={isLoading || (!prompt.trim() && !image)} className="mt-4 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-teal-700 disabled:bg-teal-300 transition-all duration-300 flex items-center justify-center shadow hover:shadow-md transform hover:-translate-y-px">
                    {isLoading ? <><Spinner size="sm" /> <span className="ml-2">Generating Video...</span></> : 'Generate Video'}
                </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            
            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col justify-center items-center h-64 bg-slate-100 rounded-lg">
                        <Spinner size="lg" />
                        <p className="mt-4 text-slate-600">{loadingMessage}</p>
                    </div>
                )}
                {videoUrl && (
                    <div className="flex justify-center">
                        <video src={videoUrl} controls autoPlay loop className="rounded-lg shadow-lg max-w-full h-auto" />
                    </div>
                )}
            </div>
        </div>
    );
};
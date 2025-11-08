import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality, FunctionDeclaration, LiveServerMessage } from "@google/genai";
import { decode, decodeAudioData } from '../lib/audioUtils';

// Fix: Declared 'ai' as a mutable variable using 'let' instead of 'const' to allow reassigning its value.
// It will be re-initialized by 'getAi()' before each API call to ensure the latest API key is used, especially for Veo.
let aiInstance: GoogleGenAI;

// This function must be called before making any API calls
// to ensure the latest API key is used, especially for Veo.
const getAi = () => {
  if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
  }
  // Create a new instance each time to ensure the latest API key is used.
  aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return aiInstance;
}

// Low-latency text generation
export const getQuickVerse = async (prompt: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
    return response.text;
};

// Image Generation
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Image generation failed, no image bytes returned.");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// New function for Inspirational Art
export const getInspirationalArt = async (theme: string): Promise<{ verse: string, imageUrl: string }> => {
    const ai = getAi();
    
    // Step 1: Get a verse and an image prompt from Gemini Pro
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `You are a spiritual art curator. Provide a JSON object with two keys:
1. "verse": A short, powerful, and encouraging bible verse about ${theme}. Include the reference (e.g., John 3:16).
2. "imagePrompt": A detailed, artistic prompt for an image generation model that visually captures the essence of the provided verse. The prompt should describe a beautiful, serene, and symbolic scene. Do not include any text in the image prompt.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    verse: {
                        type: Type.STRING,
                        description: "A short bible verse with reference.",
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed image generation prompt.",
                    },
                },
                propertyOrdering: ["verse", "imagePrompt"],
            },
            thinkingConfig: { thinkingBudget: 32768 }, // Max budget for 2.5-pro for complex text generation
        },
    });

    const jsonStr = textResponse.text.trim();
    const { verse, imagePrompt } = JSON.parse(jsonStr);

    // Step 2: Generate the image using the image prompt
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1', // Default aspect ratio for art
        },
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Image generation failed for inspirational art.");
    }
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return { verse, imageUrl };
};

// Chat functionality
export const createChat = (): Chat => {
    const ai = getAi();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are Kairos, a warm, empathetic, and wise faith companion. Your purpose is to offer gentle guidance, uplifting encouragement, and insightful reflections rooted in spiritual principles and biblical wisdom. Speak with kindness and understanding.',
        },
    });
};

// Text-to-speech for analysis results or chat messages
export const textToSpeech = async (text: string): Promise<AudioBuffer> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Or other suitable voice like 'Kore', 'Puck'
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from text-to-speech API.");
    }

    // Decoding audio data
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
    );
};

// Fix: Added an exported function `connectLiveSession` to encapsulate the ai.live.connect call.
// This allows the LiveConversation component to import and use it, centralizing the Gemini API client creation.
// Updated to accept `model` as a direct argument, and `callbacks`/`config` within a `params` object.
export const connectLiveSession = async (
    model: string,
    params: {
        callbacks: {
            onopen?: () => void;
            onmessage?: (message: LiveServerMessage) => void;
            onerror?: (e: ErrorEvent) => void;
            onclose?: (e: CloseEvent) => void;
        };
        config: {
            responseModalities: Modality[];
            speechConfig?: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: string;
                    };
                };
                multiSpeakerVoiceConfig?: {
                    speakerVoiceConfigs: {
                        speaker: string;
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: string;
                            };
                        };
                    }[];
                };
            };
            systemInstruction?: string;
            outputAudioTranscription?: {};
            inputAudioTranscription?: {};
            tools?: FunctionDeclaration[];
        };
    },
) => {
    const ai = getAi();
    return await ai.live.connect({
        model,
        callbacks: params.callbacks,
        config: params.config,
    });
};


// Deep Study Assistant for complex queries
export const getDeepStudyAnalysis = async (prompt: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Provide a comprehensive, thoughtful, and encouraging spiritual analysis on the following topic or scripture. Organize your response with clear headings, bullet points, and actionable takeaways for daily life application. Aim for depth and insight.

Topic/Question: "${prompt}"`,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }, // Max budget for 2.5-pro for deep analysis
        },
    });
    return response.text;
};

// Grounding search for factual/location-based queries
export const getGroundedResponse = async (
    prompt: string,
    useMaps: boolean,
    location?: { latitude: number, longitude: number }
): Promise<{ text: string, sources: any[] }> => {
    const ai = getAi();
    const tools: any[] = [];
    if (!useMaps) {
      tools.push({googleSearch: {}});
    } else {
      tools.push({googleMaps: {}});
      // Request camera permission if not already granted and using maps
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'prompt' || permissionStatus.state === 'denied') {
        throw new Error('Geolocation permission is required for map search.');
      }
    }
    
    // Config for toolConfig is only applicable when useMaps is true.
    const toolConfig = useMaps && location ? { retrievalConfig: { latLng: location } } : undefined;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash for quick grounded responses
        contents: prompt,
        config: {
            tools: tools,
            toolConfig: toolConfig,
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
};

// Personalized Growth Plan
export const getPersonalizedPlan = async (topic: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Pro for generating structured plans
        contents: `You are a spiritual growth coach. Generate a compassionate and actionable 7-day personalized spiritual growth plan focused on the theme of "${topic}".
The plan should include:
- A title for the plan.
- A brief introduction to the theme.
- For each day (Day 1 to Day 7):
    - A key scripture verse (e.g., "John 3:16")
    - A short reflection on the verse.
    - An actionable step or challenge for the day.
Format the response using Markdown for readability with clear headings and bullet points.`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }, // Max budget for 2.5-pro for complex plan generation
        },
    });
    return response.text;
};

// Image Analysis
export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Pro for complex image analysis
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                    },
                },
                {
                    text: `Analyze this image in the context of Christian faith and promises. Specifically, respond to: "${prompt}"`,
                },
            ],
        },
        config: {
          thinkingConfig: { thinkingBudget: 32768 }, // Max budget for 2.5-pro for deep analysis
        },
    });
    return response.text;
};

// Image Editing
export const editImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Flash-image for general image generation and editing
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt, // User's editing prompt
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE], // Must be an array with a single `Modality.IMAGE` element.
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No edited image data received.");
};

// Video Analysis (Simulated as per guidelines)
export const analyzeVideoContent = async (videoFile: File, prompt: string): Promise<string> => {
    // In a real application, you'd upload the video to a service
    // and send a reference to Gemini for analysis.
    // As per the guidelines, direct browser video analysis is not supported by the Gemini SDK.
    // This is a simulated response.
    console.log(`Simulating video analysis for: ${videoFile.name} with prompt: ${prompt}`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
    return `Simulated analysis for "${prompt}": The video likely contains themes of [identified theme] and symbolizes [spiritual meaning]. Further real analysis would provide detailed timestamps and object recognition.`;
};

// Video Generation
export const generateVideo = async (prompt: string, aspectRatio: string, image?: { data: string, mimeType: string }): Promise<string> => {
    const ai = getAi();

    let operation;

    if (image) {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt, // prompt is optional if image is provided, but user supplies it
            image: {
                imageBytes: image.data,
                mimeType: image.mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p', // Default to 720p for fast generation
                aspectRatio: aspectRatio,
            }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p', // Default to 720p for fast generation
                aspectRatio: aspectRatio,
            }
        });
    }

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed, no download link returned.");
    }

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    // NOTE: For browser environment, direct fetch will often hit CORS issues.
    // The CDN hosting the video might require the API key directly in the request.
    // For local testing or specific environments, a proxy might be needed if direct fetch fails.
    // For this context, we will return the URI, assuming the UI can handle the fetch with the key.
    return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const getDailyBibleReading = async (): Promise<{ chapter: string, verse: string, reflection: string }> => {
    const ai = getAi();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Use the current date as part of the prompt to get a deterministic reading for the day
    const prompt = `Provide a single, short Bible chapter or a specific verse range for today's reading (${today}), and a brief, encouraging reflection (2-3 sentences) on its message. Format the output as a JSON object with 'chapter', 'verse', and 'reflection' keys. Do not include the chapter in the 'verse' field if it is a whole chapter reading.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash for quick text generation
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    chapter: {
                        type: Type.STRING,
                        description: "The full chapter reference (e.g., 'Psalm 23').",
                    },
                    verse: {
                        type: Type.STRING,
                        description: "A specific verse range if applicable (e.g., 'John 3:16-17'), or an empty string if it's a full chapter reading.",
                    },
                    reflection: {
                        type: Type.STRING,
                        description: "A short, encouraging reflection (2-3 sentences) on the reading.",
                    },
                },
                propertyOrdering: ["chapter", "verse", "reflection"],
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// New function for Prayer Request & Support
export const submitPrayerRequest = async (request: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash model for quick, empathetic responses
        contents: `You are a compassionate and wise spiritual guide. A user has shared the following prayer request: "${request}". Please provide a brief, uplifting, and encouraging response, offering comfort, hope, and words of faith. Do not offer explicit prayers, but rather encouragement and support.`,
        config: {
            // Optional: Consider adjusting maxOutputTokens if responses are too long or too short
            maxOutputTokens: 250, 
            thinkingConfig: { thinkingBudget: 100 },
        },
    });
    return response.text;
};

// New function for God's Promises in Scripture
export const getGodsPromises = async (topic: string): Promise<{ verses: string[], reflection: string, relatedTopics: string[] }> => {
    const ai = getAi();
    const prompt = `As a spiritual guide, find 2-3 significant Bible verses that represent God's promises related to the topic of "${topic}". Also, provide a short, encouraging reflection (2-4 sentences) that ties these verses together and applies them to daily life. Finally, suggest 3-5 other related topics for God's promises that users might want to explore, based on the initial topic or the verses found.

Format your response as a JSON object with three keys:
1. "verses": an array of strings, where each string is a Bible verse with its reference (e.g., "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope. - Jeremiah 29:11").
2. "reflection": a string containing the encouraging reflection.
3. "relatedTopics": an array of strings, each being a suggested related topic.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using Pro for better reasoning and scripture retrieval
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    verses: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                        description: "An array of Bible verses with references.",
                    },
                    reflection: {
                        type: Type.STRING,
                        description: "A short, encouraging reflection on the verses.",
                    },
                    relatedTopics: { // New property for related topics
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                        description: "An array of suggested related topics.",
                    },
                },
                propertyOrdering: ["verses", "reflection", "relatedTopics"], // Ensure new property is ordered
            },
            thinkingConfig: { thinkingBudget: 32768 }, // Max budget for 2.5-pro for complex text generation
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// New function for Promise Lifeline
export const getPromiseLifeline = async (challenge: string): Promise<{ verse: string; reflection: string; declaration: string; action: string; }> => {
    const ai = getAi();
    const prompt = `You are a compassionate and wise spiritual guide. A user is struggling with "${challenge}". Provide them with a "Promise Lifeline" to help them apply God's word to their situation.
    
    Generate a JSON object with the following four keys:
    1. "verse": A single, powerful Bible verse that directly addresses the user's struggle. Include the reference.
    2. "reflection": A short, empathetic reflection (2-3 sentences) explaining how this promise applies to their situation right now.
    3. "declaration": A short, personalized, first-person declaration or prayer for the user to speak aloud, starting with "I declare..." or "I pray...". This should be based on the promise in the verse.
    4. "action": One small, concrete, and encouraging action the user can take immediately to begin walking in this truth.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    verse: {
                        type: Type.STRING,
                        description: "A single, powerful Bible verse with its reference.",
                    },
                    reflection: {
                        type: Type.STRING,
                        description: "A short, empathetic reflection on the verse.",
                    },
                    declaration: {
                        type: Type.STRING,
                        description: "A short, first-person declaration or prayer based on the verse.",
                    },
                    action: {
                        type: Type.STRING,
                        description: "A small, actionable step for the user.",
                    },
                },
                propertyOrdering: ["verse", "reflection", "declaration", "action"],
            },
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};
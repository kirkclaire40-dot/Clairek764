import React, { useState } from 'react';
import { Chat, DeepStudy, GroundingSearch, LiveConversation, VerseOfTheDay, VideoAnalyzer, GratitudeJournal, PersonalizedPlan, InspirationalArt, ImageGenerator, ImageEditor, DailyBibleReading, VideoGenerator, PrayerRequestSupport, GodsPromises, PromiseLifeline } from './components/features';
import { FeatureCard } from './components/FeatureCard';
import { ChatIcon, BookOpenIcon, GlobeIcon, MicIcon, SparklesIcon, FilmIcon, ArrowLeftIcon, JournalIcon, PlanIcon, SettingsIcon, ImageIcon, BibleIcon, HandsPrayingIcon, ScrollIcon, LifelineIcon } from './components/Icons';
import type { Feature } from './types';
import { SettingsModal } from './components/SettingsModal';
import { useNotifications } from './hooks/useNotifications';

const features: Feature[] = [
  { id: 'verse', title: 'Verse for the Moment', description: 'Receive a quick, uplifting promise to brighten your day and remind you of God\'s faithfulness, delivered instantly.', icon: <SparklesIcon />, component: VerseOfTheDay },
  { id: 'dailyReading', title: 'Daily Bible Reading', description: 'Begin your day with spiritual nourishment. Discover a fresh scripture passage and a thoughtful reflection to gently guide your walk with God.', icon: <BibleIcon />, component: DailyBibleReading },
  { id: 'lifeline', title: 'Promise Lifeline', description: 'In a tough moment? Get immediate, guided encouragement with a relevant promise, reflection, and an actionable step to find your footing.', icon: <LifelineIcon />, component: PromiseLifeline },
  { id: 'godsPromises', title: 'God\'s Promises in Scripture', description: 'Discover divine assurances by topic, receiving relevant Bible verses and uplifting reflections for daily encouragement.', icon: <ScrollIcon />, component: GodsPromises },
  { id: 'art', title: 'Inspirational Art', description: 'Discover uplifting verses beautifully paired with AI-generated art, offering a moment of visual and spiritual reflection and encouragement.', icon: <ImageIcon />, component: InspirationalArt },
  { id: 'imageGenerator', title: 'Create Visual Promises', description: 'Transform your faith-inspired thoughts into stunning, personalized images with powerful AI generation, bringing your spiritual visions to life.', icon: <ImageIcon />, component: ImageGenerator },
  { id: 'imageEditor', title: 'Edit & Reflect on Images', description: 'Upload a personal image and use AI to enhance, modify, or discover spiritual meaning within it, turning your photos into moments of reflection.', icon: <ImageIcon />, component: ImageEditor },
  { id: 'videoGenerator', title: 'Animate Your Faith', description: 'Bring scripture and spiritual concepts to life by generating short videos from text or images.', icon: <FilmIcon />, component: VideoGenerator },
  { id: 'journal', title: 'Gratitude Journal', description: 'Cultivate a heart of thankfulness by tenderly recording your blessings and answered prayers each day, fostering a deeper connection with God.', icon: <JournalIcon />, component: GratitudeJournal },
  { id: 'plan', title: 'Personalized Growth Plan', description: 'Embark on a unique spiritual journey with a tailored 7-day plan, offering guiding verses, thoughtful reflections, and actionable steps for personal growth.', icon: <PlanIcon />, component: PersonalizedPlan },
  { id: 'chat', title: 'Faith Companion Chat', description: 'Engage in uplifting conversations, ask questions, and receive gentle guidance and encouragement from Kairos, your empathetic AI companion.', icon: <ChatIcon />, component: Chat },
  { id: 'deepStudy', title: 'Deep Study Assistant', description: 'Delve into complex biblical and theological questions, receiving in-depth, structured analyses, cross-references, and profound insights for a richer understanding and personal revelation.', icon: <BookOpenIcon />, component: DeepStudy },
  { id: 'search', title: 'Explore & Discover', description: 'Find relevant, up-to-date information on biblical history, theological concepts, and local faith communities, expanding your spiritual knowledge.', icon: <GlobeIcon />, component: GroundingSearch },
  { id: 'live', title: 'Voice Companion', description: 'Experience real-time, low-latency voice conversations for immediate spiritual support, reflection, and engaging dialogue.', icon: <MicIcon />, component: LiveConversation },
  { id: 'videoAnalyzer', title: 'Reflect on Video', description: 'Upload videos and gain spiritual insights or thematic reflections through AI analysis (experimental), exploring the deeper meanings within your visual content.', icon: <FilmIcon />, component: VideoAnalyzer },
  { id: 'prayerRequest', title: 'Prayer Request & Support', description: 'Share your prayer requests and receive a compassionate, AI-generated encouraging response, rooted in faith and hope.', icon: <HandsPrayingIcon />, component: PrayerRequestSupport },
];

export default function App() {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize notification listener
  useNotifications();

  const renderDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} onSelect={() => setActiveFeature(feature)} />
      ))}
    </div>
  );

  const ActiveComponent = activeFeature?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-rose-50 to-teal-50 font-sans">
      <header className="bg-white/60 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center">
             {activeFeature && (
              <button
                onClick={() => setActiveFeature(null)}
                className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeftIcon />
              </button>
            )}
           </div>
          <h1 className={`text-2xl font-semibold text-slate-700 text-center flex-grow ${activeFeature ? 'ml-4' : ''}`}>
            {activeFeature ? activeFeature.title : 'Divine Promises Daily'}
          </h1>
          <div className="flex items-center justify-end w-10">
             {!activeFeature && (
               <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                  aria-label="Open settings"
                >
                  <SettingsIcon />
                </button>
             )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent ? <ActiveComponent /> : renderDashboard()}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by Gemini. For inspiration and reflection.</p>
      </footer>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
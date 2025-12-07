import React, { useState, useMemo, useEffect } from 'react';
import { ViewState, Topic, Audiocast, TrackStatus } from './types';
import { generateSpinOutline, generateTrackAudio, generateImage } from './services/gemini';
import { TopicDetail } from './components/TopicDetail';
import { TopicCard } from './components/TopicCard';
import { MusicPlayer } from './components/MusicPlayer';
import { Search, Sparkles, Loader2, Play, Key } from 'lucide-react';
import { TOPICS, AUDIOCASTS as DEFAULT_AUDIOCASTS } from './constants';

interface SpinSession {
  topic: Topic;
  tracks: Audiocast[];
  createdAt: number;
}

const EXAMPLE_PROMPTS = [
  "Explain Quantum Physics",
  "Daily Tech News Briefing",
  "Meditation for Anxiety",
  "The History of Jazz"
];

const App: React.FC = () => {
  // --- Auth State ---
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // --- Data State (Persistent) ---
  const [spins, setSpins] = useState<Record<string, SpinSession>>(() => {
    // Initialize with default content
    const initial: Record<string, SpinSession> = {};
    TOPICS.forEach(t => {
      initial[t.id] = {
        topic: t,
        tracks: DEFAULT_AUDIOCASTS.filter(a => a.topicId === t.id),
        createdAt: 0 // Default topics appear last
      };
    });
    return initial;
  });

  // --- Navigation State ---
  const [view, setView] = useState<ViewState>('BROWSE');
  const [viewingSpinId, setViewingSpinId] = useState<string | null>(null);

  // --- Player State ---
  const [playingSpinId, setPlayingSpinId] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // --- Generation UI State ---
  const [prompt, setPrompt] = useState("");
  const [isSpinningUp, setIsSpinningUp] = useState(false);

  // --- Auth Check ---
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // --- Derived Selectors ---
  
  // The Spin currently being viewed (Detail View)
  const viewedSession = viewingSpinId ? spins[viewingSpinId] : null;

  // The Spin currently playing (Player)
  const playingSession = playingSpinId ? spins[playingSpinId] : null;
  const currentTrack = useMemo(() => 
    playingSession?.tracks.find(t => t.id === playingTrackId) || null, 
  [playingSession, playingTrackId]);

  // List of spins for the Grid (Sorted by Newest)
  const sortedSpins = useMemo(() => {
    return Object.values(spins).sort((a, b) => b.createdAt - a.createdAt);
  }, [spins]);

  // --- Actions ---

  const handleStartSpin = async () => {
    if (!prompt.trim()) return;
    setIsSpinningUp(true);
    
    // 1. Create ID & Topic Placeholder
    const spinId = `spin-${Date.now()}`;
    const initialTopic: Topic = {
      id: spinId,
      title: prompt, // Temporary title until generation complete
      imageUrl: '', // Empty string triggers the animated mesh gradient
      description: 'Generating...'
    };

    // 2. Optimistic Update
    setSpins(prev => ({
      ...prev,
      [spinId]: {
        topic: initialTopic,
        tracks: [],
        createdAt: Date.now()
      }
    }));
    
    setViewingSpinId(spinId);
    setView('TOPIC_DETAIL');
    setPrompt("");

    try {
      // 3. Generate Outline (returns creative title & image prompt)
      const outline = await generateSpinOutline(initialTopic.title);
      
      // Update Topic with Creative Title
      setSpins(prev => ({
        ...prev,
        [spinId]: {
          ...prev[spinId],
          topic: {
            ...prev[spinId].topic,
            title: outline.title,
            description: 'Custom generated spin'
          }
        }
      }));

      // Trigger Spin Cover Generation (Parallel)
      generateImage(outline.coverImagePrompt).then(imageUrl => {
        if (imageUrl) {
          setSpins(prev => ({
            ...prev,
            [spinId]: {
              ...prev[spinId],
              topic: {
                ...prev[spinId].topic,
                imageUrl: imageUrl
              }
            }
          }));
        }
      });
      
      // 4. Create Placeholder Tracks
      const newTracks: Audiocast[] = outline.tracks.map((item, idx) => ({
        id: `track-${spinId}-${idx}`,
        topicId: spinId,
        title: item.title,
        description: item.description,
        imageUrl: '',
        audioUrl: '',
        status: 'pending'
      }));

      // Update State with Tracks
      setSpins(prev => ({
        ...prev,
        [spinId]: {
          ...prev[spinId],
          tracks: newTracks
        }
      }));

      setIsSpinningUp(false);

      // 5. Kick off generation for tracks
      generateAssetsForTracks(spinId, outline.title, newTracks);

    } catch (e) {
      console.error("Failed to start spin", e);
      setIsSpinningUp(false);
    }
  };

  const generateAssetsForTracks = async (spinId: string, topicTitle: string, trackList: Audiocast[]) => {
    for (const track of trackList) {
      await generateSingleTrackAssets(spinId, topicTitle, track);
    }
  };

  const generateSingleTrackAssets = async (spinId: string, topicTitle: string, track: Audiocast) => {
    // Update status to Writing
    updateTrackInSpin(spinId, track.id, { status: 'generating' });

    try {
      // 1. Image (Parallel) - Construct a prompt for the track
      const trackImagePrompt = `Abstract, minimalist digital art album cover for a podcast episode titled "${track.title}" within the album "${topicTitle}". Dark, moody, high quality.`;
      
      generateImage(trackImagePrompt).then(imageUrl => {
        if (imageUrl) updateTrackInSpin(spinId, track.id, { imageUrl });
      });

      // 2. Audio Generation
      const audioUrl = await generateTrackAudio(track.title, track.description || "", topicTitle);
      
      // Update status to Ready
      updateTrackInSpin(spinId, track.id, { 
        audioUrl, 
        status: 'ready' 
      });

      // Auto-play first track if nothing playing
      setPlayingTrackId(prev => {
        if (!prev) {
           setPlayingSpinId(spinId);
           return track.id;
        }
        return prev;
      });

    } catch (e) {
      console.error(`Error generating track ${track.title}`, e);
      updateTrackInSpin(spinId, track.id, { status: 'error' });
    }
  };

  const updateTrackInSpin = (spinId: string, trackId: string, updates: Partial<Audiocast>) => {
    setSpins(prev => {
      const session = prev[spinId];
      if (!session) return prev;
      
      const newTracks = session.tracks.map(t => 
        t.id === trackId ? { ...t, ...updates } : t
      );
      
      return {
        ...prev,
        [spinId]: { ...session, tracks: newTracks }
      };
    });
  };

  const handleSteer = (steerPrompt: string, position: 'next' | 'last') => {
    if (!playingSpinId) return;
    const session = spins[playingSpinId];
    if (!session) return;

    const newTrack: Audiocast = {
      id: `steer-${Date.now()}`,
      topicId: session.topic.id,
      title: "Spin Update", 
      description: steerPrompt,
      imageUrl: '',
      audioUrl: '',
      status: 'pending'
    };

    // Insert into list
    let updatedTracks = [...session.tracks];
    if (position === 'last') {
      updatedTracks.push(newTrack);
    } else {
      const currentIndex = session.tracks.findIndex(t => t.id === playingTrackId);
      const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
      updatedTracks.splice(insertIndex, 0, newTrack);
    }

    // Update State
    setSpins(prev => ({
        ...prev,
        [playingSpinId]: { ...session, tracks: updatedTracks }
    }));

    // Trigger Generation
    generateSingleTrackAssets(playingSpinId, session.topic.title, newTrack);
  };

  // --- Player Callbacks ---

  const handlePlayTrack = (track: Audiocast) => {
    if (track.status === 'ready') {
      if (view === 'TOPIC_DETAIL' && viewingSpinId) {
        setPlayingSpinId(viewingSpinId);
      }
      setPlayingTrackId(track.id);
    }
  };

  const handleNext = () => {
    if (!playingSession) return;
    const idx = playingSession.tracks.findIndex(t => t.id === playingTrackId);
    if (idx < playingSession.tracks.length - 1) {
      setPlayingTrackId(playingSession.tracks[idx + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!playingSession) return;
    const idx = playingSession.tracks.findIndex(t => t.id === playingTrackId);
    if (idx > 0) {
      setPlayingTrackId(playingSession.tracks[idx - 1].id);
    }
  };

  // --- Auth Screen ---
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-2xl">
           <Sparkles className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Unlock Spins</h1>
        <p className="text-neutral-400 max-w-md text-lg mb-10 leading-relaxed">
           To generate high-quality images and audio with Gemini Pro, you need to connect your Google AI Studio API key.
        </p>
        <button 
          onClick={handleSelectKey}
          disabled={isCheckingKey}
          className="bg-white text-black hover:bg-neutral-200 py-4 px-8 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3"
        >
          {isCheckingKey ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Key className="w-5 h-5" />
          )}
          Select API Key
        </button>
        <p className="mt-8 text-xs text-neutral-600">
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-neutral-400">
             Learn more about billing
           </a>
        </p>
      </div>
    );
  }

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 pb-32">
      
      {/* Hero / Prompt Section */}
      <div className="flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-violet-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center ring-1 ring-white/10">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-neutral-500">
          Spins
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl mb-10 max-w-md font-light mx-auto">
          Turn any idea into a steerable audio experience.
        </p>

        <div className="w-full max-w-xl relative mx-auto z-20">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I want a sci-fi story about a robot who loves jazz..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all resize-none shadow-2xl"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleStartSpin();
              }
            }}
          />
          <div className="absolute bottom-4 right-4">
            <button 
              onClick={handleStartSpin}
              disabled={!prompt.trim() || isSpinningUp}
              className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-colors shadow-lg"
            >
               {isSpinningUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>
        </div>

        {/* Example Suggestions */}
        <div className="mt-12 w-full max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-neutral-500 tracking-widest uppercase mb-6">Or try an example</p>
          <div className="flex flex-wrap justify-center gap-3">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-sm text-neutral-400 hover:text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="px-6 max-w-7xl mx-auto w-full mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Spins</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
          {sortedSpins.map((session) => (
            <TopicCard 
              key={session.topic.id} 
              topic={session.topic} 
              onClick={() => {
                setViewingSpinId(session.topic.id);
                setView('TOPIC_DETAIL');
              }} 
            />
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-rose-500/30">
      
      {/* Navigation View Switching */}
      <div className={`transition-opacity duration-300 ${isPlayerExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {view === 'BROWSE' && renderHome()}

        {view === 'TOPIC_DETAIL' && viewedSession && (
          <TopicDetail
            topic={viewedSession.topic}
            audiocasts={viewedSession.tracks}
            currentAudiocast={currentTrack} // Highlight if it matches currently playing
            isPlaying={playingSpinId === viewedSession.topic.id && !!currentTrack} 
            onBack={() => {
              setView('BROWSE');
              setViewingSpinId(null);
            }}
            onPlayAudiocast={(track) => {
               // Explicitly switch context to this spin
               setPlayingSpinId(viewedSession.topic.id);
               setPlayingTrackId(track.id);
            }}
            onPlayTopic={() => {
              const readyTrack = viewedSession.tracks.find(t => t.status === 'ready');
              if (readyTrack) {
                setPlayingSpinId(viewedSession.topic.id);
                setPlayingTrackId(readyTrack.id);
              }
            }}
          />
        )}
      </div>

      {/* Persistent Player Overlay */}
      {currentTrack && playingSession && (
        <MusicPlayer 
          audiocast={currentTrack}
          queue={playingSession.tracks}
          topic={playingSession.topic}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onPlayTrack={(track) => setPlayingTrackId(track.id)}
          isExpanded={isPlayerExpanded}
          onToggleExpand={setIsPlayerExpanded}
          onSteer={handleSteer}
        />
      )}
    </div>
  );
};

export default App;
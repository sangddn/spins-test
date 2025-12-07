import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { Audiocast, Topic } from '../types';
import { Play, Pause, SkipForward, SkipBack, Volume2, ChevronDown, MoreHorizontal, Loader2, ListMusic, Plus, CornerDownRight, ListEnd } from 'lucide-react';

interface MusicPlayerProps {
  audiocast: Audiocast;
  queue: Audiocast[];
  topic?: Topic | null;
  onNext: () => void;
  onPrevious: () => void;
  onPlayTrack: (track: Audiocast) => void;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  onSteer: (prompt: string, position: 'next' | 'last') => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  audiocast, 
  queue,
  topic,
  onNext, 
  onPrevious,
  onPlayTrack,
  isExpanded,
  onToggleExpand,
  onSteer
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Steering State
  const [steerPrompt, setSteerPrompt] = useState("");
  const [showQueue, setShowQueue] = useState(true);

  // Effect: Handle Track Change
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);

    if (audiocast.status === 'ready' && audioRef.current) {
      audioRef.current.src = audiocast.audioUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Autoplay failed", e));
    }
  }, [audiocast]);

  // Effect: Audio Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  // Effect: Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audiocast.status !== 'ready') return;
    
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleSteerSubmit = (e: FormEvent, position: 'next' | 'last') => {
    e.preventDefault();
    if (!steerPrompt.trim()) return;
    onSteer(steerPrompt, position);
    setSteerPrompt("");
  };

  const displayImage = audiocast.imageUrl || topic?.imageUrl;

  // --- MINI PLAYER ---
  if (!isExpanded) {
    return (
      <div 
        onClick={() => onToggleExpand(true)}
        className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/90 backdrop-blur-xl border-t border-white/5 pb-safe cursor-pointer hover:bg-neutral-800/90 transition-colors"
      >
        <audio ref={audioRef} />
        {/* Progress Bar (Thin) */}
        <div className="w-full h-0.5 bg-neutral-800">
          <div 
            className="h-full bg-rose-500" 
            style={{ width: `${(progress / duration) * 100}%` }} 
          />
        </div>

        <div className="flex items-center justify-between p-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 rounded bg-neutral-800 flex-shrink-0 overflow-hidden shadow-md">
               {displayImage ? (
                 <img src={displayImage} className="w-full h-full object-cover" alt="Mini Cover" />
               ) : (
                 <div className="w-full h-full animate-mesh" />
               )}
            </div>
            <div className="min-w-0">
               <h4 className="font-medium text-white text-sm truncate leading-tight">{audiocast.title}</h4>
               <p className="text-neutral-400 text-xs truncate">
                 {audiocast.status === 'ready' ? 'Now Playing' : 'Generating...'}
               </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={togglePlay} disabled={audiocast.status !== 'ready'} className="text-white hover:text-rose-500 transition-colors disabled:opacity-50">
                {audiocast.status !== 'ready' ? (
                   <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                ) : isPlaying ? (
                   <Pause className="w-6 h-6 fill-current" />
                ) : (
                   <Play className="w-6 h-6 fill-current" />
                )}
             </button>
             <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-neutral-400 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6 fill-current" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL PLAYER (MODAL) ---
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/95 backdrop-blur-3xl animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <audio ref={audioRef} />
      
      {/* Dynamic Background */}
      {displayImage ? (
        <div 
          className="fixed inset-0 opacity-30 blur-[100px] pointer-events-none"
          style={{ backgroundImage: `url(${displayImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ) : (
        <div className="fixed inset-0 opacity-20 pointer-events-none animate-mesh" />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-center pt-8 pb-4 px-6 bg-gradient-to-b from-neutral-900/90 to-transparent">
        <button 
          onClick={() => onToggleExpand(false)}
          className="absolute left-6 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
        <span className="text-xs font-medium tracking-widest uppercase text-white/50">Playing from Spin</span>
      </div>

      {/* Main Scrollable Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center p-6 w-full max-w-lg mx-auto pb-32">
        
        {/* Main Artwork */}
        <div className="relative w-full aspect-square rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden mb-8 transform transition-transform duration-500 hover:scale-[1.02] bg-neutral-800">
           {displayImage ? (
             <img src={displayImage} className="w-full h-full object-cover" alt="Full Cover" />
           ) : (
             <div className="w-full h-full animate-mesh flex items-center justify-center">
                {/* Optional: Add spinner on top of mesh if generating? */}
             </div>
           )}
           
           {/* Loader Overlay for Track Status (not image status) */}
           {audiocast.status !== 'ready' && audiocast.status !== 'error' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
               <Loader2 className="w-12 h-12 animate-spin text-white drop-shadow-lg" />
             </div>
           )}
        </div>

        {/* Title Info */}
        <div className="w-full flex items-center justify-between mb-6">
           <div className="text-left overflow-hidden">
             <h2 className="text-2xl font-bold text-white leading-tight break-words">{audiocast.title}</h2>
             <p className="text-lg text-rose-500 font-medium truncate">{topic?.title || 'Unknown Spin'}</p>
           </div>
        </div>

        {/* Scrubber */}
        <div className="w-full mb-8 group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            disabled={audiocast.status !== 'ready'}
            className="w-full h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-neutral-200 hover:accent-white disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-2 font-medium">
            <span>{formatTime(progress)}</span>
            <span>-{formatTime(duration - progress)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mb-10 px-4">
           <button onClick={onPrevious} className="text-white hover:text-rose-500 transition-colors active:scale-90">
             <SkipBack className="w-10 h-10 fill-current" />
           </button>
           
           <button 
             onClick={togglePlay}
             disabled={audiocast.status !== 'ready'}
             className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 disabled:opacity-50 disabled:scale-100"
           >
             {audiocast.status !== 'ready' ? (
               <Loader2 className="w-8 h-8 animate-spin" />
             ) : isPlaying ? (
               <Pause className="w-8 h-8 fill-current" />
             ) : (
               <Play className="w-8 h-8 fill-current ml-1" />
             )}
           </button>

           <button onClick={onNext} className="text-white hover:text-rose-500 transition-colors active:scale-90">
             <SkipForward className="w-10 h-10 fill-current" />
           </button>
        </div>

        {/* Steering Input */}
        <div className="w-full mb-8 bg-neutral-800/50 backdrop-blur-md p-4 rounded-xl border border-white/5">
          <label className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2 block">Steer the Spin</label>
          <textarea
            value={steerPrompt}
            onChange={(e) => setSteerPrompt(e.target.value)}
            placeholder="Add a track about..."
            className="w-full bg-neutral-900/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors resize-none h-20 mb-3"
          />
          <div className="flex gap-2">
            <button 
              onClick={(e) => handleSteerSubmit(e, 'next')}
              disabled={!steerPrompt.trim()}
              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <CornerDownRight className="w-4 h-4" />
              Play Next
            </button>
            <button 
              onClick={(e) => handleSteerSubmit(e, 'last')}
              disabled={!steerPrompt.trim()}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <ListEnd className="w-4 h-4" />
              Add to End
            </button>
          </div>
        </div>

        {/* Up Next Queue */}
        <div className="w-full">
           <div className="flex items-center gap-2 mb-4">
             <ListMusic className="w-5 h-5 text-neutral-400" />
             <h3 className="text-sm font-bold text-white uppercase tracking-wider">Up Next</h3>
           </div>
           
           <div className="space-y-2">
             {queue.map((track, i) => {
               const isCurrent = track.id === audiocast.id;
               return (
                 <div 
                   key={track.id}
                   onClick={() => onPlayTrack(track)}
                   className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                     isCurrent ? 'bg-white/10 border border-rose-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'
                   }`}
                 >
                   {/* Status Indicator */}
                   <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      {track.status === 'generating' || track.status === 'pending' ? (
                        <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                      ) : isCurrent && isPlaying ? (
                        <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">{i + 1}</span>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2">
                       <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-rose-500' : 'text-white'}`}>
                         {track.title}
                       </h4>
                       {track.status === 'pending' && <span className="text-[10px] bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-400">WAITING</span>}
                     </div>
                     <p className="text-xs text-neutral-400 truncate">{track.description || 'Generated Track'}</p>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

      </div>
    </div>
  );
};
import React from 'react';
import { Topic, Audiocast } from '../types';
import { TrackRow } from './TrackRow';
import { Play, Shuffle, ChevronLeft } from 'lucide-react';

interface TopicDetailProps {
  topic: Topic;
  audiocasts: Audiocast[];
  currentAudiocast: Audiocast | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlayAudiocast: (audiocast: Audiocast) => void;
  onPlayTopic: () => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  audiocasts,
  currentAudiocast,
  isPlaying,
  onBack,
  onPlayAudiocast,
  onPlayTopic
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 pb-32 animate-in slide-in-from-right duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-rose-500 font-medium active:opacity-50"
        >
          <ChevronLeft className="w-6 h-6 -ml-2" />
          <span>Back</span>
        </button>
      </div>

      <div className="p-6 flex flex-col items-center md:items-start md:flex-row md:gap-8">
        {/* Album Art */}
        <div className="w-64 h-64 md:w-72 md:h-72 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden mb-6 mx-auto md:mx-0 bg-neutral-800 relative">
          {topic.imageUrl ? (
            <img 
              src={topic.imageUrl} 
              alt={topic.title} 
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full animate-mesh" />
          )}
        </div>

        {/* Info & Actions */}
        <div className="flex-1 w-full text-center md:text-left space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{topic.title}</h1>
          <p className="text-rose-500 font-medium">Spins Studio &middot; 2024</p>
          <p className="text-neutral-400 text-sm uppercase tracking-wide font-medium pb-4">
            AI Generated &middot; High Quality Stereo
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 pb-4">
            <button 
              onClick={onPlayTopic}
              className="flex-1 md:flex-none md:w-40 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play</span>
            </button>
            <button className="flex-1 md:flex-none md:w-40 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-rose-500 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Shuffle className="w-5 h-5" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-4 space-y-1">
        {audiocasts.map((ac, index) => (
          <TrackRow
            key={ac.id}
            audiocast={ac}
            index={index}
            isActive={currentAudiocast?.id === ac.id}
            isPlaying={isPlaying}
            onClick={() => onPlayAudiocast(ac)}
          />
        ))}
      </div>
    </div>
  );
};
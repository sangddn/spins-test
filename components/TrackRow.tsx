import React from 'react';
import { Audiocast } from '../types';
import { Play, BarChart3, Loader2, AlertCircle } from 'lucide-react';

interface TrackRowProps {
  audiocast: Audiocast;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ 
  audiocast, 
  index, 
  isActive, 
  isPlaying, 
  onClick 
}) => {
  const isReady = audiocast.status === 'ready';
  const isError = audiocast.status === 'error';
  const isPending = audiocast.status === 'pending' || audiocast.status === 'generating';

  return (
    <div 
      onClick={() => isReady && onClick()}
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        isActive ? 'bg-white/10' : isReady ? 'hover:bg-white/5 cursor-pointer' : 'opacity-50 cursor-default'
      }`}
    >
      <div className="w-6 flex justify-center text-sm font-medium text-neutral-500">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : isActive && isPlaying ? (
          <BarChart3 className="w-4 h-4 text-rose-500 animate-pulse" />
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        
        {isReady && !isActive && (
           <Play className={`w-3 h-3 text-neutral-300 hidden group-hover:block`} fill="currentColor" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-base truncate ${isActive ? 'text-rose-500 font-semibold' : 'text-white font-medium'}`}>
          {audiocast.title}
        </h4>
        {audiocast.description && (
          <p className="text-xs text-neutral-500 truncate">{audiocast.description}</p>
        )}
      </div>

      <div className="text-neutral-500">
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-600">
          {audiocast.status === 'ready' ? 'PLAY' : audiocast.status}
        </span>
      </div>
    </div>
  );
};
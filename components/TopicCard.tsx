import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <div
      onClick={() => onClick(topic)}
      className="group flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform duration-200"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-800 shadow-lg">
        {topic.imageUrl ? (
          <img
            src={topic.imageUrl}
            alt={topic.title}
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full animate-mesh" />
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-white leading-tight">{topic.title}</h3>
        <p className="text-xs text-neutral-400">Spins &middot; Audiocast</p>
      </div>
    </div>
  );
};
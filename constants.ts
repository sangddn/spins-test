import { Topic, Audiocast } from './types';

export const TOPICS: Topic[] = [
  {
    id: 'tech',
    title: 'Technology',
    imageUrl: 'https://picsum.photos/id/1/600/600',
  },
  {
    id: 'news',
    title: 'News',
    imageUrl: 'https://picsum.photos/id/20/600/600',
  },
  {
    id: 'music',
    title: 'Music',
    imageUrl: 'https://picsum.photos/id/39/600/600',
  },
  {
    id: 'sports',
    title: 'Sports',
    imageUrl: 'https://picsum.photos/id/73/600/600',
  },
];

export const AUDIOCASTS: Audiocast[] = [
  // Tech
  { 
    id: 't1', 
    topicId: 'tech', 
    title: 'Are we in an AI Bubble?', 
    imageUrl: 'https://picsum.photos/id/119/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_tech_Are_we_in_an_AI_Bubble.wav',
    status: 'ready'
  },
  { 
    id: 't2', 
    topicId: 'tech', 
    title: 'Smart Glasses Revolution', 
    imageUrl: 'https://picsum.photos/id/180/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_tech_Smart_Glasses_Revolution.wav',
    status: 'ready'
  },
  { 
    id: 't3', 
    topicId: 'tech', 
    title: 'Quantum Computing 101', 
    imageUrl: 'https://picsum.photos/id/201/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_tech_Quantum_Computing_101.wav',
    status: 'ready'
  },
  { 
    id: 't4', 
    topicId: 'tech', 
    title: 'The Future of Coding', 
    imageUrl: 'https://picsum.photos/id/366/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_tech_The_Future_of_Coding.wav',
    status: 'ready'
  },
  // News
  { 
    id: 'n1', 
    topicId: 'news', 
    title: 'Climate Summit Update', 
    imageUrl: 'https://picsum.photos/id/10/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_news_Climate_Summit_Update.wav',
    status: 'ready'
  },
  { 
    id: 'n2', 
    topicId: 'news', 
    title: 'Global Economy Watch', 
    imageUrl: 'https://picsum.photos/id/24/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_news_Global_Economy_Watch.wav',
    status: 'ready'
  },
  { 
    id: 'n3', 
    topicId: 'news', 
    title: 'Space Exploration News', 
    imageUrl: 'https://picsum.photos/id/49/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_news_Space_Exploration_News.wav',
    status: 'ready'
  },
  { 
    id: 'n4', 
    topicId: 'news', 
    title: 'Urban Development', 
    imageUrl: 'https://picsum.photos/id/59/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_news_Urban_Development.wav',
    status: 'ready'
  },
  // Music
  { 
    id: 'm1', 
    topicId: 'music', 
    title: 'Synthwave Revival', 
    imageUrl: 'https://picsum.photos/id/145/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_news_Synthwave_Revival.wav',
    status: 'ready'
  },
  { 
    id: 'm2', 
    topicId: 'music', 
    title: 'History of Jazz', 
    imageUrl: 'https://picsum.photos/id/158/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_music_History_of_Jazz.wav',
    status: 'ready'
  },
  { 
    id: 'm3', 
    topicId: 'music', 
    title: 'Pop Culture Trends', 
    imageUrl: 'https://picsum.photos/id/250/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_music_Pop_Culture_Trends.wav',
    status: 'ready'
  },
  { 
    id: 'm4', 
    topicId: 'music', 
    title: 'Indie Scene 2024', 
    imageUrl: 'https://picsum.photos/id/338/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_music_Indie_Scene_2024.wav',
    status: 'ready'
  },
  // Sports
  { 
    id: 's1', 
    topicId: 'sports', 
    title: 'F1 Season Recap', 
    imageUrl: 'https://picsum.photos/id/191/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_sports_F1_Season_Recap.wav',
    status: 'ready'
  },
  { 
    id: 's2', 
    topicId: 'sports', 
    title: 'Marathon Training', 
    imageUrl: 'https://picsum.photos/id/160/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_sports_Marathon_Training.wav',
    status: 'ready'
  },
  { 
    id: 's3', 
    topicId: 'sports', 
    title: 'NBA Finals Preview', 
    imageUrl: 'https://picsum.photos/id/177/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_sports_NBA_Finals_Preview.wav',
    status: 'ready'
  },
  { 
    id: 's4', 
    topicId: 'sports', 
    title: 'Extreme Sports', 
    imageUrl: 'https://picsum.photos/id/107/600/600',
    audioUrl: 'https://storage.googleapis.com/jex_public/Spins_sports_Extreme_Sports.wav',
    status: 'ready'
  },
];

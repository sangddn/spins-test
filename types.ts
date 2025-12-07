export interface Topic {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
}

export type TrackStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface Audiocast {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  imageUrl: string;
  audioUrl: string;
  status: TrackStatus;
  duration?: number;
}

export type ViewState = 'BROWSE' | 'TOPIC_DETAIL';
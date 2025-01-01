export interface BaseMessage {
  isUser: boolean;
  timestamp: Date;
  userAvatar?: string;
}

export interface TextMessage extends BaseMessage {
  content: string;
}

export interface CreativeContent extends BaseMessage {
  contentType: 'image' | 'video' | 'music' | 'text';
  content: string;
  prompt: string;
}

export type Message = TextMessage | CreativeContent;

export interface Suggestion {
  category: string;
  suggestions: string[];
}

export interface Insight {
  category: string;
  content: string;
}

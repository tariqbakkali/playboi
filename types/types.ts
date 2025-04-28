export interface Profile {
  id: string;
  name: string;
  vibe: string;
  imageUrl?: string;
  likes: string[];
  dislikes: string[];
  notes: string;
  lastConversation?: {
    id: string;
    date: string;
    summary: string;
  };
  nextReminder?: {
    id: string;
    date: string;
    title: string;
    type: string;
  };
}

export interface Conversation {
  id: string;
  personId: string;
  personName: string;
  date: string;
  topics: string[];
  summary: string;
  mood: string;
  nextMove?: string;
  read: boolean;
  flagged: boolean;
}

export interface Reminder {
  id: string;
  personId: string;
  personName: string;
  date: string;
  title: string;
  notes?: string;
  type: 'followUp' | 'date' | 'birthday' | 'other';
  completed: boolean;
}
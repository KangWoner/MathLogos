
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  images?: string[];
}

export interface StudentProfile {
  name: string;
  grade: string; // 1, 2, 3 high school
  mathLevel: string; // CSAT Tier (1-9)
  targetUniversities: string[];
}

export interface University {
  name: string;
  difficulty: 'High' | 'Medium' | 'Low';
  type: 'General' | 'Medical' | 'Engineering';
}

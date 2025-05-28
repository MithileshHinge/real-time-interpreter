export interface Message {
  id: number;
  speaker: string;
  text: string;
  language: string;
  timestamp: string;
  isFinal?: boolean;
}

export interface AppState {
  messages: Message[];
  isConnected: boolean;
  currentSpeaker: 'doctor' | 'patient';
  isRecording: boolean;
}

export type Speaker = 'doctor' | 'patient'; 
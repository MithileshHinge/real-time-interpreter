import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppState, Message, Speaker } from '../../types';

const initialState: AppState = {
  messages: [],
  isConnected: false,
  currentSpeaker: 'doctor',
  isRecording: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<Partial<Message> & { id: number }>) => {
      const { id, ...updates } = action.payload;
      const index = state.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...updates,
        } as Message;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setCurrentSpeaker: (state, action: PayloadAction<Speaker>) => {
      state.currentSpeaker = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  clearMessages,
  setIsConnected,
  setCurrentSpeaker,
  setIsRecording,
} = appSlice.actions;

export default appSlice.reducer; 
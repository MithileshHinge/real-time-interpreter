import { useEffect, useRef } from 'react';
import { useMicVAD } from "@ricky0123/vad-react";
import io, { Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { 
  setIsConnected,
  setIsRecording, 
  addMessage,
  updateMessage
} from '../store/slices/appSlice';

export const useTranscription = () => {
  const dispatch = useDispatch();
  const { currentSpeaker } = useSelector((state: RootState) => state.app);
  const socketRef = useRef<Socket | null>(null);
  // Keep track of the most recent partial message id for each speaker so that we can
  // update the same store record instead of adding duplicates.
  const partialIdsRef = useRef<Record<string, number | null>>({ doctor: null, patient: null });

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected');
      dispatch(setIsConnected(true));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      dispatch(setIsConnected(false));
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socketRef.current.on('transcription', (data) => {
      console.log('Received transcription:', data);

      const speaker = data.speaker || currentSpeaker;
      const language = data.language || (speaker === 'doctor' ? 'en' : 'es');

      // Handle ongoing / partial transcription
      if (!data.isFinal) {
        let currentId = partialIdsRef.current[speaker];

        // If we don't yet have a temporary message for this speaker, create one
        if (!currentId) {
          currentId = Date.now();
          partialIdsRef.current[speaker] = currentId;

          dispatch(addMessage({
            id: currentId,
            speaker,
            text: data.text,
            language,
            timestamp: new Date().toLocaleTimeString(),
            isFinal: false,
          }));
        } else {
          // Otherwise, just update the text
          dispatch(updateMessage({ id: currentId, text: data.text }));
        }
        return; // Nothing else to do until the final transcription arrives
      }

      // When a final transcription arrives, close any partial message if present
      const existingPartialId = partialIdsRef.current[speaker];
      if (existingPartialId) {
        dispatch(updateMessage({ id: existingPartialId, text: data.text, isFinal: true }));
        partialIdsRef.current[speaker] = null;
      } else {
        // No partial message existed; just add a new final message
        dispatch(addMessage({
          id: Date.now(),
          speaker,
          text: data.text,
          language,
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
        }));
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('Server error:', error);
    });

    socketRef.current.on('summary', (data) => {
      console.log('Received summary:', data);
      // TODO: Display summary in UI
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentSpeaker, dispatch]);

  // VAD configuration
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log("Speech started");
      dispatch(setIsRecording(true));
      
      if (socketRef.current?.connected) {
        console.log('starting transcription');
        socketRef.current.emit('startTranscription', {
          speaker: currentSpeaker,
          language: currentSpeaker === 'doctor' ? 'en-US' : 'es-ES'
        });
      }
    },
    onSpeechEnd: () => {
      console.log("Speech ended");
      dispatch(setIsRecording(false));
      
      if (socketRef.current?.connected) {
        console.log('stopping transcription');
        socketRef.current.emit('stopTranscription');
      }
    },
    onFrameProcessed: (probabilities, frame) => {
      if (vad.userSpeaking && probabilities.isSpeech > 0.8 && socketRef.current?.connected) {
        const int16Array = new Int16Array(frame.length);
        for (let i = 0; i < frame.length; i++) {
          const s = Math.max(-1, Math.min(1, frame[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        console.log('sending audio frame');
        socketRef.current.emit('audioData', int16Array.buffer);
      }
    }
  });

  const startSession = () => {
    vad.start();
  };

  const endSession = () => {
    vad.pause();
    if (socketRef.current?.connected) {
      socketRef.current.emit('generateSummary');
    }
  };

  return {
    vad,
    startSession,
    endSession
  };
}; 
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCurrentSpeaker, clearMessages } from '../store/slices/appSlice';

interface ControlButtonsProps {
  onStartSession: () => void;
  onEndSession: () => void;
  isListening: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  onStartSession,
  onEndSession,
  isListening,
}) => {
  const dispatch = useDispatch();
  const { isConnected, currentSpeaker } = useSelector((state: RootState) => state.app);

  const handleToggleSpeaker = () => {
    dispatch(setCurrentSpeaker(currentSpeaker === 'doctor' ? 'patient' : 'doctor'));
  };

  const handleClearConversation = () => {
    dispatch(clearMessages());
  };

  const buttonBaseClasses = "px-5 md:px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full">
      <button
        onClick={onStartSession}
        disabled={!isConnected || isListening}
        className={`${buttonBaseClasses} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white focus:ring-green-500`}
      >
        <span className="text-lg">▶️</span>
        Start Session
      </button>
      
      <button
        onClick={onEndSession}
        disabled={!isListening}
        className={`${buttonBaseClasses} bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white focus:ring-red-500`}
      >
        <span className="text-lg">⏹️</span>
        End Session
      </button>
      
      <button
        onClick={handleClearConversation}
        className={`${buttonBaseClasses} bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white focus:ring-gray-500`}
      >
        <span className="text-lg">🗑️</span>
        Clear
      </button>

      <button
        onClick={handleToggleSpeaker}
        className={`${buttonBaseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white focus:ring-blue-500`}
      >
        <span className="text-lg">{currentSpeaker === 'doctor' ? '👨‍⚕️' : '🧑'}</span>
        Switch Speaker
      </button>
    </div>
  );
};

export default ControlButtons; 
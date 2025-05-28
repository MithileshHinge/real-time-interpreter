import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const StatusBar: React.FC = () => {
  const { isConnected, isRecording, currentSpeaker } = useSelector((state: RootState) => state.app);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50/60 dark:bg-neutral-800/70 backdrop-blur-md p-4 rounded-xl border border-gray-200 dark:border-neutral-700">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className={`text-sm font-medium ${
            isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${
            isRecording ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-400'
          }`}>
            {isRecording ? 'Recording' : 'Ready'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
        <span className="text-sm font-medium">Current Speaker:</span>
        <span className="text-sm font-bold">
          {currentSpeaker === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}
        </span>
      </div>
    </div>
  );
};

export default StatusBar; 
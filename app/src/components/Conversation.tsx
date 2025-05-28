import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const AVATARS = {
  doctor: '👨‍⚕️',
  patient: '🧑',
};

const LANG_LABELS: Record<string, string> = {
  'en': 'English',
  'en-US': 'English',
  'es': 'Spanish',
  'es-ES': 'Spanish',
};

const CHAT_HEIGHT = 'min-h-[450px] lg:min-h-[65vh]';

const Conversation: React.FC = () => {
  const { messages } = useSelector((state: RootState) => state.app);

  return (
    <div 
      className={`bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md border border-gray-200 dark:border-neutral-700 rounded-3xl shadow-2xl ${CHAT_HEIGHT} flex flex-col w-full`}
    >
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full py-12 text-gray-400 dark:text-gray-500">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-5xl">💬</span>
            </div>
            <span className="text-2xl font-semibold mb-2">No conversation yet</span>
            <span className="text-base text-center max-w-xs">Start a session and begin speaking to see messages here.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto px-6 py-8">
            {messages.map((message) => {
              const isDoctor = message.speaker === 'doctor';
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${isDoctor ? 'justify-start' : 'justify-end'}`}
                >
                  {isDoctor && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xl select-none">{AVATARS.doctor}</span>
                    </div>
                  )}
                  <div
                    className={`relative max-w-xs sm:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-sm
                      ${isDoctor 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-900 dark:text-blue-100 rounded-bl-none' 
                        : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 text-green-900 dark:text-green-100 rounded-br-none'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold">
                        {isDoctor ? 'Doctor' : 'Patient'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                        {LANG_LABELS[message.language] || message.language}
                      </span>
                    </div>
                    <div className="text-sm break-words whitespace-pre-line leading-relaxed">
                      {message.text}
                      {message.isFinal === false && (
                        <span className="ml-1 animate-pulse select-none">...</span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-50 mt-1.5 text-right">
                      {message.timestamp}
                    </div>
                  </div>
                  {!isDoctor && (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <span className="text-xl select-none">{AVATARS.patient}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation; 
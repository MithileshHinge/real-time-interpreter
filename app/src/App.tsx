import { useTranscription } from './services/transcriptionService';
import StatusBar from './components/StatusBar';
import ControlButtons from './components/ControlButtons';
import Conversation from './components/Conversation';

const App = () => {
  const { vad, startSession, endSession } = useTranscription();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 px-4 py-10">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Controls */}
        <div className="lg:col-span-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-gray-200 dark:border-neutral-700 rounded-3xl shadow-2xl p-8 flex flex-col gap-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500 bg-clip-text">
            Medical Interpreter
          </h1>
          <StatusBar />
          <ControlButtons
            onStartSession={startSession}
            onEndSession={endSession}
            isListening={vad.listening}
          />
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-8 relative flex flex-col">
          <Conversation />
          {vad.userSpeaking && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-5 py-2 rounded-full shadow-xl backdrop-blur-sm">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping delay-150"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping delay-300"></div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
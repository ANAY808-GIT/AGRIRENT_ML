import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceSearchButton({
  onTranscript,
  className = '',
  placeholderText = 'Listening... Speak now',
  title = 'Search by Voice (Speech to Text)'
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech-to-Text is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Use en-IN (Indian English) with fallback to en-US for high agricultural term recognition
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const rawTranscript = event.results[0][0].transcript;
          // Strip ending punctuation like periods
          const cleaned = rawTranscript.replace(/[.,?!]+$/, '').trim();
          if (cleaned && onTranscript) {
            onTranscript(cleaned);
          }
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser to use voice search.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Listening... Click to stop voice search' : title}
        className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400 scale-105 animate-pulse'
            : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95'
        } ${className}`}
        aria-label="Voice Search"
      >
        {isListening ? (
          <span className="flex items-center gap-1">
            <Mic className="w-4 h-4 animate-bounce text-white" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white hidden sm:inline">
              Listening...
            </span>
          </span>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating status pill when actively listening */}
      {isListening && (
        <div className="absolute right-0 -top-9 z-30 whitespace-nowrap px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Speak now...</span>
        </div>
      )}
    </div>
  );
}


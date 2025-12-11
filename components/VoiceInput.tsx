
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  // Track if the user *intentionally* stopped it, to prevent auto-restart loops if we want that later
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        // Critical change: continuous true allows pauses without stopping
        recognitionInstance.continuous = true; 
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          // Loop through results to get the latest finalized chunk
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          // Ignore 'no-speech' (user stopped talking) and 'aborted' (manual stop/unmount)
          // as these are expected behaviors in many browsers.
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }

          console.error('Speech recognition error', event.error);
          
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setIsListening(false);
            shouldBeListeningRef.current = false;
          }
        };

        recognitionInstance.onend = () => {
          // If we expect to be listening but the browser stopped (timeout/silence), restart it
          if (shouldBeListeningRef.current) {
             try {
               recognitionInstance.start();
             } catch (e) {
               // Fail silently if restart fails, usually means user denied permission or device issue
               setIsListening(false);
               shouldBeListeningRef.current = false;
             }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognitionInstance;
      } else {
        setIsSupported(false);
      }
    }
    
    return () => {
      // When unmounting, we stop listening. 
      // This might trigger 'aborted' error which is handled above.
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      shouldBeListeningRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isListening 
          ? 'bg-rose-100 text-rose-600 animate-pulse ring-2 ring-rose-200' 
          : 'bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
      } ${className}`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      <Icons.Mic className="w-5 h-5" />
    </button>
  );
};

/**
 * Speech Recognition Hook
 * 
 * Voice commands using Web Speech API
 */

import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    onCommand?: (command: string) => void;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
    const {
        continuous = true,
        interimResults = false,
        lang = 'en-US',
        onCommand
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        setIsSupported(true);

        // Create recognition instance
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = continuous;
        recognitionInstance.interimResults = interimResults;
        recognitionInstance.lang = lang;

        // Event handlers
        recognitionInstance.onresult = (event: any) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;

            setTranscript(transcript);

            // Trigger command callback on final result
            if (result.isFinal && onCommand) {
                onCommand(transcript);
            }
        };

        recognitionInstance.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            if (recognitionInstance) {
                recognitionInstance.stop();
            }
        };
    }, [continuous, interimResults, lang, onCommand]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
                setTranscript('');
            } catch (error) {
                console.error('Failed to start recognition:', error);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript
    };
}

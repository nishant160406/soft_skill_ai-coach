'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './VoiceRecorder.module.css';

/**
 * VoiceRecorder Component
 * Records voice input and converts to text using Web Speech API
 */
export default function VoiceRecorder({
    onTranscript,
    onRecordingChange,
    language = 'en-US',
    className = '',
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);
    const [volume, setVolume] = useState(0);

    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const streamRef = useRef(null);
    const transcriptRef = useRef(''); // Track transcript in ref to avoid stale closures

    // Update ref when transcript changes
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // Call onTranscript when transcript changes
    useEffect(() => {
        if (onTranscript && transcript) {
            onTranscript(transcript);
        }
    }, [transcript, onTranscript]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Speech recognition not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript + ' ';
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalText) {
                setTranscript(prev => {
                    const newTranscript = prev + finalText;
                    return newTranscript;
                });
            }
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
            } else if (event.error === 'no-speech') {
                // Ignore no-speech errors, they're common
            } else if (event.error !== 'aborted') {
                setError(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            // Only restart if we're still recording
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [language]);

    // Volume visualization
    const startVolumeMonitor = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateVolume = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setVolume(average / 128);
                    animationRef.current = requestAnimationFrame(updateVolume);
                }
            };

            updateVolume();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone');
        }
    };

    const stopVolumeMonitor = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setVolume(0);
    };

    // Toggle recording
    const toggleRecording = useCallback(async () => {
        if (!isSupported) return;

        if (isRecording) {
            // Stop recording
            try {
                recognitionRef.current?.stop();
            } catch (e) {
                // Ignore
            }
            stopVolumeMonitor();
            setIsRecording(false);
            setInterimTranscript('');
            if (onRecordingChange) onRecordingChange(false);

            // Final transcript is already sent via useEffect
        } else {
            // Start recording
            setError(null);
            setTranscript('');
            setInterimTranscript('');
            transcriptRef.current = '';

            try {
                await startVolumeMonitor();
                recognitionRef.current?.start();
                setIsRecording(true);
                if (onRecordingChange) onRecordingChange(true);
            } catch (err) {
                console.error('Start recording error:', err);
                setError('Could not start recording. Check microphone permissions.');
            }
        }
    }, [isSupported, isRecording, onRecordingChange]);

    // Clear transcript
    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        transcriptRef.current = '';
        if (onTranscript) onTranscript('');
    }, [onTranscript]);

    if (!isSupported) {
        return (
            <div className={`${styles.voiceRecorder} ${styles.unsupported} ${className}`}>
                <div className={styles.errorMessage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Voice input not supported in this browser</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.voiceRecorder} ${className}`}>
            {/* Recording Button */}
            <button
                className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
                onClick={toggleRecording}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <div
                    className={styles.pulseRing}
                    style={{ transform: `scale(${1 + volume * 0.5})` }}
                />
                <div className={styles.buttonInner}>
                    {isRecording ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </div>
            </button>

            {/* Status Text */}
            <div className={styles.status}>
                {isRecording ? (
                    <span className={styles.recordingStatus}>
                        <span className={styles.recordingDot} />
                        Recording... Click to stop
                    </span>
                ) : (
                    <span>Click to speak your response</span>
                )}
            </div>

            {/* Live Transcript Preview */}
            {(transcript || interimTranscript) && (
                <div className={styles.transcriptPreview}>
                    <span className={styles.transcriptText}>
                        {transcript}
                        <span className={styles.interim}>{interimTranscript}</span>
                    </span>
                    {!isRecording && transcript && (
                        <button className={styles.clearButton} onClick={clearTranscript}>
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className={styles.error}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}

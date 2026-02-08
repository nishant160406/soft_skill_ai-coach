'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './VoiceRecorder.module.css';

/**
 * VoiceRecorder Component - Optimized for Performance
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

    // Refs for stable references (no re-renders)
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const streamRef = useRef(null);
    const isRecordingRef = useRef(false);
    const interimRef = useRef(''); // Track interim in ref for instant access
    const lastVolumeUpdateRef = useRef(0); // Throttle volume updates
    const dataArrayRef = useRef(null); // Reuse data array

    // Stable callback refs to avoid re-creating speech recognition
    const onTranscriptRef = useRef(onTranscript);
    const onRecordingChangeRef = useRef(onRecordingChange);

    useEffect(() => {
        onTranscriptRef.current = onTranscript;
        onRecordingChangeRef.current = onRecordingChange;
    }, [onTranscript, onRecordingChange]);

    // Call onTranscript when transcript changes
    useEffect(() => {
        if (onTranscriptRef.current) {
            onTranscriptRef.current(transcript);
        }
    }, [transcript]);

    // Check browser support on mount using separate effect
    const supportCheckedRef = useRef(false);

    useEffect(() => {
        if (supportCheckedRef.current) return;
        supportCheckedRef.current = true;

        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            // Use startTransition to avoid cascading render warning
            import('react').then(({ startTransition }) => {
                startTransition(() => {
                    setIsSupported(false);
                    setError('Speech recognition not supported in this browser');
                });
            });
        }
    }, []);

    // Initialize speech recognition ONCE
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        // Skip if not supported
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();

        // Optimized settings for faster response
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        // FAST result handler - minimal processing
        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';

            // Process only new results (faster than processing all)
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;

                if (result.isFinal) {
                    finalText += text + ' ';
                } else {
                    interimText += text;
                }
            }

            // Update interim ref immediately (no state update needed for ref)
            interimRef.current = interimText;

            // Batch state updates
            if (finalText) {
                setTranscript(prev => prev + finalText);
            }
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return;

            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied');
            } else {
                setError(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            // Quick restart if still recording
            if (isRecordingRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // Already started, ignore
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognitionRef.current?.stop();
            } catch (e) { }
        };
    }, [language]);

    // Optimized volume monitor with throttling
    const startVolumeMonitor = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            // Smaller FFT for faster processing
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.5;

            // Reuse data array
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            const updateVolume = () => {
                if (!analyserRef.current || !isRecordingRef.current) return;

                const now = performance.now();
                // Throttle to ~30fps (33ms) instead of 60fps
                if (now - lastVolumeUpdateRef.current > 33) {
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                    // Fast average calculation
                    let sum = 0;
                    const arr = dataArrayRef.current;
                    const len = arr.length;
                    for (let i = 0; i < len; i++) {
                        sum += arr[i];
                    }

                    setVolume(sum / (len * 128));
                    lastVolumeUpdateRef.current = now;
                }

                animationRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (err) {
            console.error('Microphone error:', err);
            setError('Could not access microphone');
        }
    }, []);

    const stopVolumeMonitor = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setVolume(0);
    }, []);

    // Optimized toggle with faster state updates
    const toggleRecording = useCallback(async () => {
        if (!isSupported) return;

        if (isRecording) {
            // STOP - Update ref immediately
            isRecordingRef.current = false;

            // Stop recognition first (fast)
            try {
                recognitionRef.current?.stop();
            } catch (e) { }

            // Stop volume monitor
            stopVolumeMonitor();

            // Get final transcript including interim
            const finalInterim = interimRef.current;

            // Update states in one batch
            setIsRecording(false);
            setInterimTranscript('');

            if (finalInterim) {
                setTranscript(prev => {
                    const result = (prev + finalInterim).trim();
                    // Notify parent immediately
                    if (result && onTranscriptRef.current) {
                        onTranscriptRef.current(result);
                    }
                    return result;
                });
            }

            interimRef.current = '';
            onRecordingChangeRef.current?.(false);
        } else {
            // START - Clear and begin
            setError(null);
            setTranscript('');
            setInterimTranscript('');
            interimRef.current = '';

            try {
                // Start volume monitor first
                await startVolumeMonitor();

                // Small delay to ensure recognition is fully stopped from previous session
                await new Promise(resolve => setTimeout(resolve, 100));

                // Try to start recognition
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        // If already started or invalid state, abort and recreate
                        if (e.name === 'InvalidStateError') {
                            recognitionRef.current.abort();
                            await new Promise(resolve => setTimeout(resolve, 50));
                            recognitionRef.current.start();
                        } else {
                            throw e;
                        }
                    }
                }

                isRecordingRef.current = true;
                setIsRecording(true);
                onRecordingChangeRef.current?.(true);
            } catch (err) {
                console.error('Start error:', err);
                setError('Could not start recording. Please try again.');
                isRecordingRef.current = false;
                setIsRecording(false);
                stopVolumeMonitor();
            }
        }
    }, [isSupported, isRecording, startVolumeMonitor, stopVolumeMonitor]);

    // Clear transcript
    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        interimRef.current = '';
        onTranscriptRef.current?.('');
    }, []);

    // Memoized class names
    const containerClass = useMemo(() =>
        `${styles.voiceRecorder} ${className}`.trim(),
        [className]
    );

    const buttonClass = useMemo(() =>
        `${styles.recordButton} ${isRecording ? styles.recording : ''}`,
        [isRecording]
    );

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
        <div className={containerClass}>
            {/* Recording Button */}
            <button
                className={buttonClass}
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

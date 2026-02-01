'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './WaveformPlayer.module.css';

/**
 * WaveformPlayer Component
 * Audio player with animated waveform visualization
 * 
 * @param {Object} props
 * @param {string} props.audioUrl - URL of the audio file to play
 * @param {string} props.text - Text to convert to speech (if no audioUrl)
 * @param {string} props.title - Title displayed above player
 * @param {string} props.className - Additional CSS classes
 */
export default function WaveformPlayer({
    audioUrl,
    text,
    title = 'Audio Feedback',
    className = '',
}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);
    const [generatedUrl, setGeneratedUrl] = useState(null);

    // Generate audio from text if no URL provided
    const generateAudio = async () => {
        if (!text) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate audio');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedUrl(url);

        } catch (err) {
            setError('Could not generate audio. Make sure the backend is running.');
            console.error('TTS Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Get the active audio URL
    const activeUrl = audioUrl || generatedUrl;

    // Handle play/pause
    const togglePlay = async () => {
        if (!activeUrl && text) {
            await generateAudio();
            return;
        }

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    // Update progress
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
        };
    }, [activeUrl]);

    // Format time
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate waveform bars
    const bars = Array.from({ length: 40 }, (_, i) => {
        const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
        return height;
    });

    return (
        <div className={`${styles.playerContainer} ${className}`}>
            {/* Hidden audio element */}
            {activeUrl && (
                <audio ref={audioRef} src={activeUrl} preload="metadata" />
            )}

            {/* Player UI */}
            <div className={styles.player}>
                {/* Play Button */}
                <button
                    className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                    onClick={togglePlay}
                    disabled={isLoading}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isLoading ? (
                        <div className={styles.spinner} />
                    ) : isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                {/* Waveform */}
                <div className={styles.waveformContainer}>
                    <div className={styles.waveform}>
                        {bars.map((height, i) => (
                            <div
                                key={i}
                                className={`${styles.bar} ${isPlaying ? styles.animating : ''}`}
                                style={{
                                    height: `${height}%`,
                                    opacity: (i / bars.length) * 100 < progress ? 1 : 0.3,
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Time display */}
                <div className={styles.timeDisplay}>
                    <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Title */}
            <div className={styles.title}>{title}</div>

            {/* Error message */}
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

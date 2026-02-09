'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import TerminalInput from '@/components/TerminalInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import NeonScoreGauge from '@/components/NeonScoreGauge';
import PulseOrb from '@/components/PulseOrb';
import WaveformPlayer from '@/components/WaveformPlayer';
import TypewriterText from '@/components/TypewriterText';

export default function AnalyzePage() {
    const [text, setText] = useState('');
    const [inputMode, setInputMode] = useState('keyboard');
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // Call the AI backend to analyze the text
    const analyzeText = useCallback(async (content) => {
        try {
            const res = await fetch('http://localhost:5000/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: content,
                    question: 'Free-form communication analysis'
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to get AI analysis');
            }

            return await res.json();
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    }, []);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResults(null);

        try {
            const analysisResults = await analyzeText(text);
            setResults(analysisResults);
        } catch (err) {
            setError('Failed to analyze text. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setText('');
        setResults(null);
        setError(null);
    };

    const handleVoiceTranscript = (transcript) => {
        setText(transcript);
    };

    const handleRecordingChange = (recording) => {
        setIsRecording(recording);
    };

    const overallScore = results
        ? Math.round((results.clarity + results.confidence + results.tone) / 3 * 10) / 10
        : 0;

    return (
        <div className={`container ${styles.analyzePage}`}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <h1>Free Analysis</h1>
                <p className={styles.subtitle}>
                    Type or speak freely — get instant AI feedback on your communication style
                </p>
            </header>

            {/* Input Mode Toggle */}
            <section className={styles.inputModeSection}>
                <div className={styles.inputModeToggle}>
                    <button
                        className={`${styles.modeButton} ${inputMode === 'keyboard' ? styles.active : ''}`}
                        onClick={() => setInputMode('keyboard')}
                        disabled={isRecording || isAnalyzing}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12" />
                        </svg>
                        Keyboard
                    </button>
                    <button
                        className={`${styles.modeButton} ${inputMode === 'voice' ? styles.active : ''}`}
                        onClick={() => setInputMode('voice')}
                        disabled={isRecording || isAnalyzing}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        Voice
                    </button>
                </div>
            </section>

            {/* Input Section */}
            {inputMode === 'keyboard' ? (
                <section className={styles.inputSection}>
                    <div className={styles.sectionLabel}>Your Text</div>
                    <TerminalInput
                        value={text}
                        onChange={setText}
                        placeholder="Type anything here... Express your thoughts, practice a speech, write a message — anything you want feedback on."
                        title="free_analysis.txt"
                        size="large"
                    />
                </section>
            ) : (
                <section className={styles.inputSection}>
                    <div className={styles.sectionLabel}>Speak Your Mind</div>
                    <GlassCard className={styles.voiceCard}>
                        <VoiceRecorder
                            onTranscript={handleVoiceTranscript}
                            onRecordingChange={handleRecordingChange}
                            language="en-US"
                        />
                        {text && !isRecording && (
                            <div className={styles.transcriptDisplay}>
                                <div className={styles.transcriptHeader}>
                                    <span>Transcribed Text</span>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => setInputMode('keyboard')}
                                    >
                                        Edit in Keyboard Mode
                                    </button>
                                </div>
                                <p className={styles.transcriptText}>{text}</p>
                            </div>
                        )}
                    </GlassCard>
                </section>
            )}

            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Submit Section */}
            <section className={styles.submitSection}>
                <span className={styles.submitInfo}>
                    {text.length > 0 ? `${text.length} characters` : 'Start typing or speaking'}
                </span>
                <div className={styles.submitActions}>
                    <HolographicButton
                        variant="ghost"
                        onClick={handleClear}
                        disabled={!text.length || isAnalyzing || isRecording}
                    >
                        Clear
                    </HolographicButton>
                    <HolographicButton
                        variant="success"
                        filled
                        onClick={handleSubmit}
                        disabled={!text.trim() || isAnalyzing || isRecording}
                        loading={isAnalyzing}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                    </HolographicButton>
                </div>
            </section>

            {/* Processing Overlay */}
            {isAnalyzing && (
                <div className={styles.processingOverlay}>
                    <PulseOrb state="processing" size="large" />
                    <span className={styles.processingText}>Analyzing your communication...</span>
                </div>
            )}

            {/* Results Section */}
            {results && (
                <section className={styles.resultsSection}>
                    <h2 className={styles.resultsTitle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20V10M18 20V4M6 20v-4" />
                        </svg>
                        Analysis Results
                    </h2>

                    {/* Overall Score */}
                    <GlassCard className={styles.overallScore}>
                        <span className={styles.overallLabel}>Overall Score</span>
                        <span className={styles.overallValue}>{overallScore}/10</span>
                        <PulseOrb state="complete" size="small" />
                    </GlassCard>

                    {/* Score Gauges */}
                    <div className={styles.scoresGrid}>
                        <GlassCard className={styles.scoreCard}>
                            <NeonScoreGauge score={results.clarity} label="Clarity" animated={true} />
                        </GlassCard>
                        <GlassCard className={styles.scoreCard} accent="green">
                            <NeonScoreGauge score={results.confidence} label="Confidence" animated={true} />
                        </GlassCard>
                        <GlassCard className={styles.scoreCard} accent="purple">
                            <NeonScoreGauge score={results.tone} label="Professional Tone" animated={true} />
                        </GlassCard>
                    </div>

                    {/* Feedback */}
                    <GlassCard className={styles.feedbackCard}>
                        <div className={styles.feedbackLabel}>
                            <span className={styles.feedbackDot}>●</span> AI Feedback
                        </div>
                        <p className={styles.feedbackText}>
                            <TypewriterText
                                text={results.feedback || 'No feedback available'}
                                speed={25}
                                hideCursorOnComplete={true}
                            />
                        </p>
                    </GlassCard>

                    {/* Improved Version */}
                    {results.improvedAnswer && (
                        <GlassCard className={styles.improvedCard}>
                            <div className={styles.improvedLabel}>
                                <span className={styles.improvedDot}>●</span> Improved Version
                            </div>
                            <p className={styles.improvedText}>{results.improvedAnswer}</p>
                        </GlassCard>
                    )}

                    {/* Audio Feedback */}
                    <GlassCard className={styles.audioCard}>
                        <div className={styles.audioLabel}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                            Audio Feedback
                        </div>
                        <WaveformPlayer
                            text={results.feedback}
                            title="Click play to hear your feedback"
                        />
                    </GlassCard>
                </section>
            )}

            {/* Back to Dashboard */}
            <section className={styles.navSection}>
                <Link href="/">
                    <HolographicButton variant="ghost">
                        ← Back to Dashboard
                    </HolographicButton>
                </Link>
            </section>
        </div>
    );
}

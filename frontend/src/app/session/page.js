'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import TerminalInput from '@/components/TerminalInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import PulseOrb from '@/components/PulseOrb';

// Sample practice questions
const practiceQuestions = [
    "Tell me about yourself and your professional background.",
    "Describe a time when you had to work with a difficult team member.",
    "How do you handle stress and pressure in the workplace?",
    "What are your greatest strengths and how do they help in your work?",
    "Describe a situation where you had to communicate complex information to someone.",
];

// Get a random question - computed once per page load
function getRandomQuestion() {
    return practiceQuestions[Math.floor(Math.random() * practiceQuestions.length)];
}

export default function SessionPage() {
    const router = useRouter();
    const [response, setResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputMode, setInputMode] = useState('keyboard'); // 'keyboard' or 'voice'
    const [isRecording, setIsRecording] = useState(false);

    // Use useMemo with empty deps to compute once on mount
    const currentQuestion = useMemo(() => getRandomQuestion(), []);

    const handleSubmit = async () => {
        if (!response.trim()) return;

        setIsProcessing(true);

        // Simulate AI processing delay (in real app, call backend API)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Store response in sessionStorage for results page
        sessionStorage.setItem('lastQuestion', currentQuestion);
        sessionStorage.setItem('lastResponse', response);

        // Mock scores (in real app, these come from AI backend)
        const mockResults = {
            clarity: Math.floor(Math.random() * 4) + 6,
            confidence: Math.floor(Math.random() * 4) + 5,
            tone: Math.floor(Math.random() * 4) + 6,
            feedback: "Your response demonstrates good structure and clear communication. Consider using more specific examples to strengthen your points. The language is professional but could benefit from more confident phrasing.",
            improvedAnswer: "I am a dedicated professional with over 5 years of experience in software development. My background includes leading cross-functional teams and delivering complex projects on time. I excel at problem-solving and thrive in collaborative environments where I can contribute to team success."
        };
        sessionStorage.setItem('lastResults', JSON.stringify(mockResults));

        router.push('/results');
    };

    const handleClear = () => {
        setResponse('');
    };

    const handleVoiceTranscript = (text) => {
        setResponse(text);
    };

    const handleRecordingChange = (recording) => {
        setIsRecording(recording);
    };

    return (
        <div className={`container ${styles.sessionPage}`}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <h1>Practice Session</h1>
                <p>Answer the question below to receive AI feedback</p>
            </header>

            {/* Question Card */}
            <section className={styles.questionSection}>
                <GlassCard className={styles.questionCard}>
                    <div className={styles.questionLabel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                        Practice Question
                    </div>
                    <p className={styles.questionText}>{currentQuestion}</p>
                </GlassCard>
            </section>

            {/* Input Mode Toggle */}
            <section className={styles.inputModeSection}>
                <div className={styles.inputModeToggle}>
                    <button
                        className={`${styles.modeButton} ${inputMode === 'keyboard' ? styles.active : ''}`}
                        onClick={() => setInputMode('keyboard')}
                        disabled={isRecording}
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
                        disabled={isRecording}
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

            {/* Response Input - Keyboard Mode */}
            {inputMode === 'keyboard' && (
                <section className={styles.responseSection}>
                    <div className={styles.sectionLabel}>Your Response</div>
                    <TerminalInput
                        value={response}
                        onChange={setResponse}
                        placeholder="Type your response here... Be clear, confident, and professional."
                        title="response.txt"
                        size="large"
                    />
                </section>
            )}

            {/* Response Input - Voice Mode */}
            {inputMode === 'voice' && (
                <section className={styles.responseSection}>
                    <div className={styles.sectionLabel}>Speak Your Response</div>
                    <GlassCard className={styles.voiceCard}>
                        <VoiceRecorder
                            onTranscript={handleVoiceTranscript}
                            onRecordingChange={handleRecordingChange}
                            language="en-US"
                        />
                        {response && !isRecording && (
                            <div className={styles.transcriptDisplay}>
                                <div className={styles.transcriptHeader}>
                                    <span>Transcribed Response</span>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => setInputMode('keyboard')}
                                    >
                                        Edit in Keyboard Mode
                                    </button>
                                </div>
                                <p className={styles.transcriptText}>{response}</p>
                            </div>
                        )}
                    </GlassCard>
                </section>
            )}

            {/* Tips */}
            <GlassCard className={styles.tipsCard} title="Pro Tips" size="small">
                <ul className={styles.tipsList}>
                    <li className={styles.tipItem}>
                        <span className={styles.tipIcon}>✓</span>
                        Use specific examples from your experience
                    </li>
                    <li className={styles.tipItem}>
                        <span className={styles.tipIcon}>✓</span>
                        Avoid filler words like &quot;um&quot;, &quot;I think maybe&quot;, &quot;kind of&quot;
                    </li>
                    <li className={styles.tipItem}>
                        <span className={styles.tipIcon}>✓</span>
                        Structure your answer with a clear beginning, middle, and end
                    </li>
                </ul>
            </GlassCard>

            {/* Submit Section */}
            <section className={styles.submitSection}>
                <span className={styles.submitInfo}>
                    {response.length > 0
                        ? `${response.length} characters written`
                        : inputMode === 'voice' ? 'Click the microphone to start speaking' : 'Start typing your response above'
                    }
                </span>
                <div className={styles.submitActions}>
                    <HolographicButton
                        variant="ghost"
                        onClick={handleClear}
                        disabled={!response.length || isProcessing || isRecording}
                    >
                        Clear
                    </HolographicButton>
                    <HolographicButton
                        variant="success"
                        filled
                        onClick={handleSubmit}
                        disabled={!response.trim() || isProcessing || isRecording}
                        loading={isProcessing}
                    >
                        {isProcessing ? 'Analyzing...' : 'Submit for Analysis'}
                    </HolographicButton>
                </div>
            </section>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className={styles.processingOverlay}>
                    <PulseOrb state="processing" size="large" />
                    <span className={styles.processingText}>Analyzing your response...</span>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import TerminalInput from '@/components/TerminalInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import PulseOrb from '@/components/PulseOrb';

// Practice questions pool
const allQuestions = [
    "Tell me about yourself and your professional background.",
    "Describe a time when you had to work with a difficult team member.",
    "How do you handle stress and pressure in the workplace?",
    "What are your greatest strengths and how do they help in your work?",
    "Describe a situation where you had to communicate complex information to someone.",
    "Tell me about a time you failed and what you learned from it.",
    "How do you prioritize tasks when you have multiple deadlines?",
    "Describe your ideal work environment.",
    "What motivates you to do your best work?",
    "How do you handle constructive criticism?",
];

// Number of questions per session
const QUESTIONS_PER_SESSION = 2;

// Get random unique questions
function getRandomQuestions(count) {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export default function SessionPage() {
    const router = useRouter();

    // Session state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionsAndResponses, setQuestionsAndResponses] = useState([]);
    const [response, setResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputMode, setInputMode] = useState('keyboard');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);

    // Get session questions (computed once on mount)
    const sessionQuestions = useMemo(() => getRandomQuestions(QUESTIONS_PER_SESSION), []);
    const currentQuestion = sessionQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

    // Call the AI backend to evaluate the response
    const evaluateResponse = useCallback(async (question, answer) => {
        try {
            const res = await fetch('http://localhost:5000/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, question }),
            });

            if (!res.ok) {
                throw new Error('Failed to get AI evaluation');
            }

            return await res.json();
        } catch (err) {
            console.error('API Error:', err);
            // Return fallback if API fails
            return {
                clarity: Math.floor(Math.random() * 3) + 6,
                confidence: Math.floor(Math.random() * 3) + 5,
                tone: Math.floor(Math.random() * 3) + 6,
                feedback: "Unable to connect to AI service. This is automated feedback: Your response shows good structure. Consider adding more specific examples and confident language.",
                improvedAnswer: answer
            };
        }
    }, []);

    const handleSubmit = async () => {
        if (!response.trim()) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Get AI evaluation for this response
            const results = await evaluateResponse(currentQuestion, response);

            // Store this Q&A pair
            const newQA = {
                question: currentQuestion,
                response: response,
                results: results
            };

            const updatedQAs = [...questionsAndResponses, newQA];
            setQuestionsAndResponses(updatedQAs);

            if (isLastQuestion) {
                // All questions answered - go to results
                sessionStorage.setItem('sessionData', JSON.stringify({
                    questionsAndResponses: updatedQAs,
                    timestamp: new Date().toISOString()
                }));

                // Legacy format for backwards compatibility
                sessionStorage.setItem('lastQuestion', currentQuestion);
                sessionStorage.setItem('lastResponse', response);
                sessionStorage.setItem('lastResults', JSON.stringify(results));

                router.push('/results');
            } else {
                // Move to next question
                setCurrentQuestionIndex(prev => prev + 1);
                setResponse('');
                setIsProcessing(false);
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Failed to process response. Please try again.');
            setIsProcessing(false);
        }
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
                <p>Answer the questions below to receive AI feedback</p>
            </header>

            {/* Progress Indicator */}
            <section className={styles.progressSection}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS_PER_SESSION) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    Question {currentQuestionIndex + 1} of {QUESTIONS_PER_SESSION}
                </span>
            </section>

            {/* Question Card */}
            <section className={styles.questionSection}>
                <GlassCard className={styles.questionCard}>
                    <div className={styles.questionLabel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                        Question {currentQuestionIndex + 1}
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
                        {isProcessing ? 'Analyzing...' : isLastQuestion ? 'Submit & View Results' : 'Next Question'}
                    </HolographicButton>
                </div>
            </section>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className={styles.processingOverlay}>
                    <PulseOrb state="processing" size="large" />
                    <span className={styles.processingText}>
                        {isLastQuestion ? 'Analyzing your responses...' : 'Processing...'}
                    </span>
                </div>
            )}
        </div>
    );
}

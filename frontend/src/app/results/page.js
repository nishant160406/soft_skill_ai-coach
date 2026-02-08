'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import NeonScoreGauge from '@/components/NeonScoreGauge';
import TypewriterText from '@/components/TypewriterText';
import PulseOrb from '@/components/PulseOrb';
import WaveformPlayer from '@/components/WaveformPlayer';

// Subscribe function for useSyncExternalStore
function subscribe(callback) {
    return () => { };
}

// Snapshot function to get stored data
function getSnapshot() {
    if (typeof window === 'undefined') return null;

    // Try new format first (multi-question)
    const sessionData = sessionStorage.getItem('sessionData');
    if (sessionData) {
        return sessionData;
    }

    // Fallback to legacy format (single question)
    const storedResults = sessionStorage.getItem('lastResults');
    const storedQuestion = sessionStorage.getItem('lastQuestion');
    const storedResponse = sessionStorage.getItem('lastResponse');

    if (storedResults) {
        return JSON.stringify({
            questionsAndResponses: [{
                question: storedQuestion || '',
                response: storedResponse || '',
                results: JSON.parse(storedResults)
            }],
            timestamp: new Date().toISOString()
        });
    }
    return null;
}

function getServerSnapshot() {
    return null;
}

export default function ResultsPage() {
    const router = useRouter();
    const [showFeedback, setShowFeedback] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(0);

    const storedDataString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const storedData = storedDataString ? JSON.parse(storedDataString) : null;

    useEffect(() => {
        if (storedData === null && typeof window !== 'undefined') {
            router.push('/session');
        }
    }, [storedData, router]);

    useEffect(() => {
        if (storedData) {
            const timer = setTimeout(() => setShowFeedback(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [storedData]);

    if (!storedData) {
        return (
            <div className={`container ${styles.resultsPage}`} style={{ textAlign: 'center', paddingTop: '100px' }}>
                <PulseOrb state="processing" />
                <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>Loading results...</p>
            </div>
        );
    }

    const { questionsAndResponses } = storedData;

    // Calculate overall scores across all questions
    const totalScores = questionsAndResponses.reduce((acc, qa) => ({
        clarity: acc.clarity + (qa.results?.clarity || 0),
        confidence: acc.confidence + (qa.results?.confidence || 0),
        tone: acc.tone + (qa.results?.tone || 0),
    }), { clarity: 0, confidence: 0, tone: 0 });

    const avgScores = {
        clarity: Math.round((totalScores.clarity / questionsAndResponses.length) * 10) / 10,
        confidence: Math.round((totalScores.confidence / questionsAndResponses.length) * 10) / 10,
        tone: Math.round((totalScores.tone / questionsAndResponses.length) * 10) / 10,
    };

    const overallScore = Math.round((avgScores.clarity + avgScores.confidence + avgScores.tone) / 3 * 10) / 10;

    return (
        <div className={`container ${styles.resultsPage}`}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <h1>Analysis Complete</h1>
                <p className={styles.sessionInfo}>
                    {questionsAndResponses.length} questions answered • {new Date().toLocaleDateString()}
                </p>
            </header>

            {/* Overall Score */}
            <GlassCard className={styles.overallScore}>
                <span className={styles.overallLabel}>Overall Score</span>
                <span className={styles.overallValue}>{overallScore}/10</span>
                <PulseOrb state="complete" size="small" />
            </GlassCard>

            {/* Average Scores */}
            <section className={styles.scoresSection}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                    </svg>
                    Average Scores
                </h2>
                <div className={styles.scoresGrid}>
                    <GlassCard className={styles.scoreCard}>
                        <NeonScoreGauge score={avgScores.clarity} label="Clarity" animated={true} />
                    </GlassCard>
                    <GlassCard className={styles.scoreCard} accent="green">
                        <NeonScoreGauge score={avgScores.confidence} label="Confidence" animated={true} />
                    </GlassCard>
                    <GlassCard className={styles.scoreCard} accent="purple">
                        <NeonScoreGauge score={avgScores.tone} label="Professional Tone" animated={true} />
                    </GlassCard>
                </div>
            </section>

            {/* Questions & Responses */}
            <section className={styles.questionsSection}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Your Responses & Feedback
                </h2>

                {questionsAndResponses.map((qa, index) => (
                    <GlassCard
                        key={index}
                        className={`${styles.qaCard} ${expandedQuestion === index ? styles.expanded : ''}`}
                    >
                        <button
                            className={styles.qaHeader}
                            onClick={() => setExpandedQuestion(expandedQuestion === index ? -1 : index)}
                        >
                            <span className={styles.qaNumber}>Q{index + 1}</span>
                            <span className={styles.qaQuestion}>{qa.question}</span>
                            <span className={styles.qaScore}>
                                {Math.round((qa.results?.clarity + qa.results?.confidence + qa.results?.tone) / 3 * 10) / 10}/10
                            </span>
                            <svg
                                className={styles.expandIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {expandedQuestion === index && (
                            <div className={styles.qaContent}>
                                {/* Individual Scores */}
                                <div className={styles.qaScores}>
                                    <div className={styles.miniScore}>
                                        <span className={styles.miniLabel}>Clarity</span>
                                        <span className={styles.miniValue}>{qa.results?.clarity}/10</span>
                                    </div>
                                    <div className={styles.miniScore}>
                                        <span className={styles.miniLabel}>Confidence</span>
                                        <span className={styles.miniValue}>{qa.results?.confidence}/10</span>
                                    </div>
                                    <div className={styles.miniScore}>
                                        <span className={styles.miniLabel}>Tone</span>
                                        <span className={styles.miniValue}>{qa.results?.tone}/10</span>
                                    </div>
                                </div>

                                {/* Your Response */}
                                <div className={styles.qaBlock}>
                                    <div className={`${styles.qaBlockLabel} ${styles.original}`}>
                                        <span>●</span> Your Response
                                    </div>
                                    <p className={styles.qaBlockText}>{qa.response}</p>
                                </div>

                                {/* AI Feedback */}
                                <div className={styles.qaBlock}>
                                    <div className={`${styles.qaBlockLabel} ${styles.feedback}`}>
                                        <span>●</span> AI Feedback
                                    </div>
                                    <p className={styles.qaBlockText}>
                                        {showFeedback ? (
                                            <TypewriterText
                                                text={qa.results?.feedback || 'No feedback available'}
                                                speed={30}
                                                hideCursorOnComplete={true}
                                            />
                                        ) : (
                                            'Generating feedback...'
                                        )}
                                    </p>
                                </div>

                                {/* Improved Answer */}
                                {qa.results?.improvedAnswer && (
                                    <div className={styles.qaBlock}>
                                        <div className={`${styles.qaBlockLabel} ${styles.improved}`}>
                                            <span>●</span> Improved Version
                                        </div>
                                        <p className={styles.qaBlockText}>{qa.results.improvedAnswer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </section>

            {/* Audio Feedback for first question */}
            {questionsAndResponses[0]?.results?.feedback && (
                <section className={styles.audioSection}>
                    <h2 className={styles.sectionTitle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                        Audio Summary
                    </h2>
                    <GlassCard className={styles.audioCard}>
                        <WaveformPlayer
                            text={questionsAndResponses[0].results.feedback}
                            title="Click play to hear your feedback"
                        />
                    </GlassCard>
                </section>
            )}

            {/* Actions */}
            <section className={styles.actionsSection}>
                <Link href="/session">
                    <HolographicButton variant="primary" filled>
                        Start New Session
                    </HolographicButton>
                </Link>
                <Link href="/history">
                    <HolographicButton variant="ghost">
                        View All History
                    </HolographicButton>
                </Link>
                <Link href="/">
                    <HolographicButton variant="ghost">
                        Back to Dashboard
                    </HolographicButton>
                </Link>
            </section>
        </div>
    );
}

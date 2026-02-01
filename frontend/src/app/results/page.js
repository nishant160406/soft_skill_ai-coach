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

// Subscribe function for useSyncExternalStore (no-op for sessionStorage)
function subscribe(callback) {
    // sessionStorage doesn't fire events, so we don't need to subscribe
    return () => { };
}

// Snapshot function to get stored data
function getSnapshot() {
    if (typeof window === 'undefined') return null;
    const storedResults = sessionStorage.getItem('lastResults');
    const storedQuestion = sessionStorage.getItem('lastQuestion');
    const storedResponse = sessionStorage.getItem('lastResponse');

    if (storedResults) {
        return JSON.stringify({
            results: JSON.parse(storedResults),
            question: storedQuestion || '',
            userResponse: storedResponse || ''
        });
    }
    return null;
}

// Server snapshot (always null)
function getServerSnapshot() {
    return null;
}

export default function ResultsPage() {
    const router = useRouter();
    const [showFeedback, setShowFeedback] = useState(false);

    // Use useSyncExternalStore to read sessionStorage without triggering re-renders
    const storedDataString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const storedData = storedDataString ? JSON.parse(storedDataString) : null;

    // Handle redirect if no data - this effect only has side effects, no setState
    useEffect(() => {
        if (storedData === null && typeof window !== 'undefined') {
            router.push('/session');
        }
    }, [storedData, router]);

    // Handle feedback delay - only runs when we have data
    useEffect(() => {
        if (storedData) {
            const timer = setTimeout(() => setShowFeedback(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [storedData]);

    // Show loading state if no data yet
    if (!storedData) {
        return (
            <div className={`container ${styles.resultsPage}`} style={{ textAlign: 'center', paddingTop: '100px' }}>
                <PulseOrb state="processing" />
                <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>Loading results...</p>
            </div>
        );
    }

    const { results, question, userResponse } = storedData;
    const overallScore = Math.round((results.clarity + results.confidence + results.tone) / 3 * 10) / 10;

    return (
        <div className={`container ${styles.resultsPage}`}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <h1>Analysis Complete</h1>
                <p className={styles.sessionInfo}>Session completed • {new Date().toLocaleDateString()}</p>
            </header>

            {/* Overall Score */}
            <GlassCard className={styles.overallScore}>
                <span className={styles.overallLabel}>Overall Score</span>
                <span className={styles.overallValue}>{overallScore}/10</span>
                <PulseOrb state="complete" size="small" />
            </GlassCard>

            {/* Individual Scores */}
            <section className={styles.scoresSection}>
                <div className={styles.scoresGrid}>
                    <GlassCard className={styles.scoreCard}>
                        <NeonScoreGauge
                            score={results.clarity}
                            label="Clarity"
                            animated={true}
                        />
                    </GlassCard>
                    <GlassCard className={styles.scoreCard} accent="green">
                        <NeonScoreGauge
                            score={results.confidence}
                            label="Confidence"
                            animated={true}
                        />
                    </GlassCard>
                    <GlassCard className={styles.scoreCard} accent="purple">
                        <NeonScoreGauge
                            score={results.tone}
                            label="Professional Tone"
                            animated={true}
                        />
                    </GlassCard>
                </div>
            </section>

            {/* AI Feedback */}
            <section className={styles.feedbackSection}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    AI Feedback
                </h2>
                <GlassCard className={styles.feedbackCard}>
                    <p className={styles.feedbackText}>
                        {showFeedback ? (
                            <TypewriterText
                                text={results.feedback}
                                speed={50}
                                hideCursorOnComplete={true}
                            />
                        ) : (
                            'Generating feedback...'
                        )}
                    </p>
                </GlassCard>
            </section>

            {/* Comparison Section */}
            <section className={styles.improvedSection}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                    </svg>
                    Response Comparison
                </h2>
                <GlassCard className={styles.improvedCard}>
                    <div className={styles.comparisonGrid}>
                        <div className={styles.comparisonItem}>
                            <div className={`${styles.comparisonLabel} ${styles.original}`}>
                                <span>●</span> Your Response
                            </div>
                            <p className={styles.comparisonText}>{userResponse}</p>
                        </div>
                        <div className={styles.comparisonItem}>
                            <div className={`${styles.comparisonLabel} ${styles.improved}`}>
                                <span>●</span> Improved Version
                            </div>
                            <p className={styles.comparisonText}>{results.improvedAnswer}</p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Audio Feedback */}
            <section className={styles.audioSection}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Audio Feedback
                </h2>
                <GlassCard className={styles.audioCard}>
                    <WaveformPlayer
                        text={results.feedback}
                        title="Click play to hear your feedback"
                    />
                </GlassCard>
            </section>

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

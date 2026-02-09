'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';

// Storage key for session history
const SESSION_HISTORY_KEY = 'softSkillCoach_sessionHistory';

// Subscribe to storage changes
function subscribeToStorage(callback) {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

// Get snapshot of history from localStorage
function getHistorySnapshot() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_HISTORY_KEY);
}

function getServerSnapshot() {
    return null;
}

export default function HistoryPage() {
    const historyJson = useSyncExternalStore(subscribeToStorage, getHistorySnapshot, getServerSnapshot);

    const history = useMemo(() => {
        if (!historyJson) return [];
        try {
            const parsedHistory = JSON.parse(historyJson);
            return parsedHistory
                .map((session, index) => ({
                    ...session,
                    id: index + 1,
                    overall: ((session.clarity + session.confidence + session.tone) / 3).toFixed(1)
                }))
                .reverse();
        } catch (e) {
            console.error('Error parsing history:', e);
            return [];
        }
    }, [historyJson]);

    const hasHistory = history.length > 0;

    // Calculate stats
    const totalSessions = history.length;
    const avgScore = totalSessions > 0
        ? (history.reduce((sum, s) => sum + parseFloat(s.overall), 0) / totalSessions).toFixed(1)
        : '--';
    const bestScore = totalSessions > 0
        ? Math.max(...history.map(s => parseFloat(s.overall))).toFixed(1)
        : '--';
    const improvement = totalSessions > 1
        ? ((parseFloat(history[0].overall) - parseFloat(history[history.length - 1].overall)) > 0 ? '+' : '') +
        (parseFloat(history[0].overall) - parseFloat(history[history.length - 1].overall)).toFixed(1)
        : '--';

    return (
        <div className={`container ${styles.historyPage}`}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <h1>Session History</h1>
                <p className="text-secondary">Track your progress over time</p>
            </header>

            {/* Stats Summary */}
            <div className={styles.statsSummary}>
                <GlassCard className={styles.statItem} size="small">
                    <div className={styles.statValue}>{totalSessions}</div>
                    <div className={styles.statLabel}>Sessions</div>
                </GlassCard>
                <GlassCard className={styles.statItem} size="small" accent="green">
                    <div className={styles.statValue}>{avgScore}</div>
                    <div className={styles.statLabel}>Avg Score</div>
                </GlassCard>
                <GlassCard className={styles.statItem} size="small" accent="purple">
                    <div className={styles.statValue}>{bestScore}</div>
                    <div className={styles.statLabel}>Best Score</div>
                </GlassCard>
                <GlassCard className={styles.statItem} size="small" accent="orange">
                    <div className={styles.statValue}>{improvement}</div>
                    <div className={styles.statLabel}>Improvement</div>
                </GlassCard>
            </div>

            {/* Timeline or Empty State */}
            {hasHistory ? (
                <div className={styles.timeline}>
                    {history.map((session) => (
                        <div key={session.id} className={styles.timelineItem}>
                            <GlassCard className={styles.sessionCard} interactive>
                                <div className={styles.sessionHeader}>
                                    <span className={styles.sessionDate}>
                                        {new Date(session.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <span className={styles.sessionScore}>
                                        {session.overall}/10
                                    </span>
                                </div>
                                <p className={styles.sessionQuestion}>{session.question}</p>
                                <div className={styles.sessionScores}>
                                    <span className={styles.miniScore}>
                                        Clarity: <span className={styles.miniScoreValue}>{session.clarity}</span>
                                    </span>
                                    <span className={styles.miniScore}>
                                        Confidence: <span className={styles.miniScoreValue}>{session.confidence}</span>
                                    </span>
                                    <span className={styles.miniScore}>
                                        Tone: <span className={styles.miniScoreValue}>{session.tone}</span>
                                    </span>
                                </div>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            ) : (
                <GlassCard className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3>No Sessions Yet</h3>
                    <p>Complete your first practice session to start tracking your progress.</p>
                    <Link href="/session">
                        <HolographicButton variant="primary" filled>
                            Start First Session
                        </HolographicButton>
                    </Link>
                </GlassCard>
            )}

            {/* Bottom CTA */}
            {hasHistory && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    <Link href="/session">
                        <HolographicButton variant="success" filled>
                            Start New Session
                        </HolographicButton>
                    </Link>
                </div>
            )}
        </div>
    );
}

'use client';

import Link from 'next/link';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';

// Mock historical data (in real app, this comes from database/API)
const mockHistory = [
    {
        id: 1,
        date: '2026-02-01',
        question: 'Tell me about yourself and your professional background.',
        clarity: 8,
        confidence: 7,
        tone: 8,
        overall: 7.7,
    },
    {
        id: 2,
        date: '2026-01-30',
        question: 'Describe a time when you had to work with a difficult team member.',
        clarity: 6,
        confidence: 5,
        tone: 7,
        overall: 6.0,
    },
    {
        id: 3,
        date: '2026-01-28',
        question: 'How do you handle stress and pressure in the workplace?',
        clarity: 7,
        confidence: 6,
        tone: 7,
        overall: 6.7,
    },
];

export default function HistoryPage() {
    const hasHistory = mockHistory.length > 0;

    // Calculate stats
    const totalSessions = mockHistory.length;
    const avgScore = totalSessions > 0
        ? (mockHistory.reduce((sum, s) => sum + s.overall, 0) / totalSessions).toFixed(1)
        : '--';
    const bestScore = totalSessions > 0
        ? Math.max(...mockHistory.map(s => s.overall)).toFixed(1)
        : '--';
    const improvement = totalSessions > 1
        ? ((mockHistory[0].overall - mockHistory[mockHistory.length - 1].overall) > 0 ? '+' : '') +
        (mockHistory[0].overall - mockHistory[mockHistory.length - 1].overall).toFixed(1)
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
                    {mockHistory.map((session) => (
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

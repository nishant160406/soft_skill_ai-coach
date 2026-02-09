'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import PulseOrb from '@/components/PulseOrb';
import TypewriterText from '@/components/TypewriterText';

// Storage key for session history
const SESSION_HISTORY_KEY = 'softSkillCoach_sessionHistory';

// Subscribe to storage changes
function subscribeToStorage(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// Get snapshot from localStorage
function getHistorySnapshot() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_HISTORY_KEY);
}

function getServerSnapshot() {
  return null;
}

export default function Dashboard() {
  const historyJson = useSyncExternalStore(subscribeToStorage, getHistorySnapshot, getServerSnapshot);

  const stats = useMemo(() => {
    if (!historyJson) return { sessions: 0, avgScore: '--', skillsImproved: 0 };

    try {
      const history = JSON.parse(historyJson);
      if (!Array.isArray(history) || history.length === 0) {
        return { sessions: 0, avgScore: '--', skillsImproved: 0 };
      }

      const sessions = history.length;
      const totalScore = history.reduce((sum, session) => {
        const avg = (session.clarity + session.confidence + session.tone) / 3;
        return sum + avg;
      }, 0);
      const avgScore = (totalScore / sessions).toFixed(1);
      const skillsImproved = history.filter(session =>
        session.clarity >= 7 || session.confidence >= 7 || session.tone >= 7
      ).length;

      return { sessions, avgScore, skillsImproved };
    } catch (e) {
      console.error('Error parsing session history:', e);
      return { sessions: 0, avgScore: '--', skillsImproved: 0 };
    }
  }, [historyJson]);

  return (
    <div className={`container ${styles.dashboard}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* AI Orb */}
          <div className={styles.heroOrb}>
            <PulseOrb state="idle" size="large" showLabel label="AI Ready" />
          </div>

          {/* Title */}
          <h1 className={styles.heroTitle}>
            Master Your Soft Skills
          </h1>

          {/* Subtitle with typewriter effect */}
          <p className={styles.heroSubtitle}>
            <TypewriterText
              text="AI-powered coaching to enhance your clarity, confidence, and professional communication. Get real-time feedback and improve with every session."
              speed={40}
              hideCursorOnComplete={true}
            />
          </p>

          {/* CTA Buttons */}
          <div className={styles.heroActions}>
            <Link href="/session">
              <HolographicButton variant="primary" size="large" filled>
                Start Practice Session
              </HolographicButton>
            </Link>
            <Link href="/analyze">
              <HolographicButton variant="success" size="large">
                Free Analysis
              </HolographicButton>
            </Link>
            <Link href="/history">
              <HolographicButton variant="ghost" size="large">
                View Progress
              </HolographicButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <GlassCard className={styles.statCard}>
            <div className={styles.statValue}>{stats.sessions}</div>
            <div className={styles.statLabel}>Sessions Completed</div>
          </GlassCard>
          <GlassCard className={styles.statCard} accent="green">
            <div className={styles.statValue}>{stats.avgScore}</div>
            <div className={styles.statLabel}>Average Score</div>
          </GlassCard>
          <GlassCard className={styles.statCard} accent="purple">
            <div className={styles.statValue}>{stats.skillsImproved}</div>
            <div className={styles.statLabel}>Skills Improved</div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionTitle}>
          <h2>How It Works</h2>
          <p>Three simple steps to better communication</p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <GlassCard className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h4 className={styles.featureTitle}>1. Write Your Response</h4>
            <p className={styles.featureDescription}>
              Answer practice questions in our terminal-style editor. Respond naturally as you would in a real interview or meeting.
            </p>
          </GlassCard>

          {/* Feature 2 */}
          <GlassCard className={styles.featureCard} accent="green">
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h4 className={styles.featureTitle}>2. Get AI Analysis</h4>
            <p className={styles.featureDescription}>
              Our AI evaluates your response on clarity, confidence, and professional tone, providing detailed scores and feedback.
            </p>
          </GlassCard>

          {/* Feature 3 */}
          <GlassCard className={styles.featureCard} accent="purple">
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h4 className={styles.featureTitle}>3. Improve & Repeat</h4>
            <p className={styles.featureDescription}>
              Review improved versions of your response, listen to audio feedback, and track your progress over time.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Quick Start */}
      <section className={styles.quickStart}>
        <GlassCard className={styles.quickStartCard}>
          <h3>Ready to Begin?</h3>
          <p>Start your first practice session and discover areas for improvement.</p>
          <Link href="/session">
            <HolographicButton variant="success" filled>
              Launch Session
            </HolographicButton>
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}

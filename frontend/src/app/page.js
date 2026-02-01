'use client';

import Link from 'next/link';
import styles from './page.module.css';
import GlassCard from '@/components/GlassCard';
import HolographicButton from '@/components/HolographicButton';
import PulseOrb from '@/components/PulseOrb';
import TypewriterText from '@/components/TypewriterText';

export default function Dashboard() {
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
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Sessions Completed</div>
          </GlassCard>
          <GlassCard className={styles.statCard} accent="green">
            <div className={styles.statValue}>--</div>
            <div className={styles.statLabel}>Average Score</div>
          </GlassCard>
          <GlassCard className={styles.statCard} accent="purple">
            <div className={styles.statValue}>0</div>
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

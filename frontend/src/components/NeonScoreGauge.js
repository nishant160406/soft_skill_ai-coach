'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './NeonScoreGauge.module.css';

/**
 * NeonScoreGauge Component
 * Circular progress indicator for displaying scores
 * 
 * @param {Object} props
 * @param {number} props.score - Score value (0-10)
 * @param {number} props.maxScore - Maximum score (default: 10)
 * @param {string} props.label - Label text below gauge
 * @param {'small'|'default'|'large'} props.size - Gauge size
 * @param {boolean} props.animated - Animate on mount
 * @param {string} props.className - Additional CSS classes
 */
export default function NeonScoreGauge({
    score = 0,
    maxScore = 10,
    label,
    size = 'default',
    animated = true,
    className = '',
}) {
    // Compute initial values based on animated prop
    const initialDisplayScore = animated ? 0 : score;
    const initialProgress = animated ? 0 : (score / maxScore) * 100;

    const [displayScore, setDisplayScore] = useState(initialDisplayScore);
    const [progress, setProgress] = useState(initialProgress);

    // Animate score on mount - only when animated is true
    useEffect(() => {
        if (!animated) return;

        const timer = setTimeout(() => {
            setDisplayScore(score);
            setProgress((score / maxScore) * 100);
        }, 100);

        return () => clearTimeout(timer);
    }, [score, maxScore, animated]);

    // Handle non-animated case - update when props change
    const computedProgress = useMemo(() => {
        if (!animated) {
            return (score / maxScore) * 100;
        }
        return progress;
    }, [animated, score, maxScore, progress]);

    const computedDisplayScore = useMemo(() => {
        if (!animated) {
            return score;
        }
        return displayScore;
    }, [animated, score, displayScore]);

    // Calculate stroke dasharray/dashoffset for SVG circle
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (computedProgress / 100) * circumference;

    // Determine score level for color coding
    const getScoreLevel = (scoreVal) => {
        const percentage = (scoreVal / maxScore) * 100;
        if (percentage < 40) return 'low';
        if (percentage < 60) return 'medium';
        if (percentage < 80) return 'high';
        return 'excellent';
    };

    const scoreLevel = getScoreLevel(score);
    const sizeClass = size !== 'default' ? styles[size] : '';

    const containerClasses = [
        styles.gaugeContainer,
        styles[scoreLevel],
        sizeClass,
        animated ? styles.animated : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            <div className={styles.gauge}>
                <svg className={styles.gaugeSvg} viewBox="0 0 120 120">
                    {/* Background track */}
                    <circle
                        className={styles.gaugeTrack}
                        cx="60"
                        cy="60"
                        r={radius}
                    />
                    {/* Progress arc */}
                    <circle
                        className={styles.gaugeProgress}
                        cx="60"
                        cy="60"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                {/* Center content */}
                <div className={styles.gaugeCenter}>
                    <span className={styles.scoreValue}>{Math.round(computedDisplayScore)}</span>
                    <span className={styles.scoreMax}>/ {maxScore}</span>
                </div>
            </div>
            {label && <span className={styles.label}>{label}</span>}
        </div>
    );
}

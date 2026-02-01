'use client';

import styles from './PulseOrb.module.css';

/**
 * PulseOrb Component
 * Animated AI status indicator orb
 * 
 * @param {Object} props
 * @param {'idle'|'processing'|'complete'|'error'} props.state - Current state
 * @param {'small'|'default'|'large'} props.size - Orb size
 * @param {boolean} props.showLabel - Show status label below orb
 * @param {string} props.label - Custom label text
 * @param {string} props.className - Additional CSS classes
 */
export default function PulseOrb({
    state = 'idle',
    size = 'default',
    showLabel = false,
    label,
    className = '',
}) {
    const sizeClass = size !== 'default' ? styles[size] : '';

    const containerClasses = [
        styles.orbContainer,
        styles[state],
        sizeClass,
        className
    ].filter(Boolean).join(' ');

    const stateLabels = {
        idle: 'Ready',
        processing: 'Analyzing...',
        complete: 'Complete',
        error: 'Error'
    };

    return (
        <div className={containerClasses}>
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing} />
            <div className={styles.orb} />
            {showLabel && (
                <span className={styles.statusLabel}>
                    {label || stateLabels[state]}
                </span>
            )}
        </div>
    );
}

'use client';

import styles from './GlassCard.module.css';

/**
 * GlassCard Component
 * A frosted glass container with futuristic styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Optional card title
 * @param {'default'|'small'|'large'} props.size - Card padding size
 * @param {'cyan'|'green'|'purple'|'orange'} props.accent - Accent color
 * @param {boolean} props.interactive - Whether card is clickable
 * @param {string} props.status - Status indicator: 'active'|'success'|'warning'|'error'
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler for interactive cards
 */
export default function GlassCard({
  children,
  title,
  size = 'default',
  accent = 'cyan',
  interactive = false,
  status,
  className = '',
  onClick,
  ...props
}) {
  const sizeClass = size !== 'default' ? styles[size] : '';
  const accentClass = accent !== 'cyan' ? styles[`accent${accent.charAt(0).toUpperCase() + accent.slice(1)}`] : '';
  const interactiveClass = interactive ? styles.interactive : '';

  const cardClasses = [
    styles.glassCard,
    sizeClass,
    accentClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses} 
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {(title || status) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {status && (
            <span className={`${styles.statusDot} ${styles[status]}`} />
          )}
        </div>
      )}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}

'use client';

import styles from './HolographicButton.module.css';

/**
 * HolographicButton Component
 * A futuristic button with glow effects and animations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary'|'success'|'danger'|'warning'|'ghost'} props.variant - Button style
 * @param {'default'|'small'|'large'} props.size - Button size
 * @param {boolean} props.filled - Use filled background style
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 * @param {boolean} props.iconOnly - Icon-only button (square)
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 * @param {string} props.type - Button type: 'button'|'submit'|'reset'
 */
export default function HolographicButton({
    children,
    variant = 'primary',
    size = 'default',
    filled = false,
    loading = false,
    disabled = false,
    fullWidth = false,
    iconOnly = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    const buttonClasses = [
        styles.button,
        styles[variant],
        size !== 'default' ? styles[size] : '',
        filled ? styles.filled : '',
        loading ? styles.loading : '',
        fullWidth ? styles.fullWidth : '',
        iconOnly ? styles.iconOnly : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            {...props}
        >
            {loading && <span className={styles.loadingSpinner} />}
            {children}
        </button>
    );
}

/**
 * ButtonGroup Component
 * Container for grouping multiple buttons
 */
export function ButtonGroup({ children, vertical = false, className = '' }) {
    const groupClasses = [
        styles.buttonGroup,
        vertical ? styles.vertical : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={groupClasses}>
            {children}
        </div>
    );
}

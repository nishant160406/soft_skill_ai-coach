'use client';

import { useState, useEffect } from 'react';
import styles from './TypewriterText.module.css';

/**
 * TypewriterText Component
 * Reveals text character by character with cursor effect
 * 
 * @param {Object} props
 * @param {string} props.text - Text to display
 * @param {number} props.speed - Characters per second (default: 50)
 * @param {boolean} props.showCursor - Show blinking cursor
 * @param {boolean} props.hideCursorOnComplete - Hide cursor when complete
 * @param {function} props.onComplete - Callback when typing completes
 * @param {'fast'|'default'|'slow'} props.cursorSpeed - Cursor blink speed
 * @param {'small'|'default'|'large'} props.size - Text size
 * @param {string} props.className - Additional CSS classes
 */
export default function TypewriterText({
    text = '',
    speed = 50,
    showCursor = true,
    hideCursorOnComplete = true,
    onComplete,
    cursorSpeed = 'default',
    size = 'default',
    className = '',
}) {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!text) {
            setDisplayText('');
            setIsComplete(false);
            return;
        }

        let currentIndex = 0;
        setIsTyping(true);
        setIsComplete(false);
        setDisplayText('');

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
                setIsComplete(true);
                if (onComplete) {
                    onComplete();
                }
            }
        }, 1000 / speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    const cursorSpeedClass = cursorSpeed !== 'default' ? styles[cursorSpeed] : '';
    const sizeClass = size !== 'default' ? styles[size] : '';

    const containerClasses = [
        styles.typewriter,
        cursorSpeedClass,
        sizeClass,
        isComplete ? styles.complete : '',
        className
    ].filter(Boolean).join(' ');

    const cursorClasses = [
        styles.cursor,
        (isComplete && hideCursorOnComplete) ? styles.hidden : ''
    ].filter(Boolean).join(' ');

    return (
        <span className={containerClasses}>
            <span className={styles.text}>{displayText}</span>
            {showCursor && <span className={cursorClasses} />}
        </span>
    );
}

/**
 * TypewriterParagraph Component
 * For longer text blocks with multiple lines
 */
export function TypewriterParagraph({ text, ...props }) {
    return (
        <p style={{ margin: 0 }}>
            <TypewriterText text={text} {...props} />
        </p>
    );
}

'use client';

import { useState, useRef, useMemo } from 'react';
import styles from './TerminalInput.module.css';

/**
 * TerminalInput Component
 * Code-editor styled text input with line numbers
 * 
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.title - Terminal title
 * @param {number} props.maxLength - Maximum character length
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.error - Show error state
 * @param {'compact'|'default'|'large'} props.size - Input size
 * @param {string} props.className - Additional CSS classes
 */
export default function TerminalInput({
    value = '',
    onChange,
    placeholder = 'Enter your response here...',
    title = 'input.txt',
    maxLength,
    disabled = false,
    error = false,
    size = 'default',
    className = '',
}) {
    const textareaRef = useRef(null);
    const [currentLine, setCurrentLine] = useState(1);

    // Compute line count from value directly (no effect needed)
    const lineCount = useMemo(() => {
        const lines = (value || '').split('\n').length;
        return Math.max(lines, 8); // Minimum 8 lines visible
    }, [value]);

    // Handle cursor position to highlight current line
    const handleSelect = () => {
        if (textareaRef.current) {
            const text = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
            const lineNumber = text.split('\n').length;
            setCurrentLine(lineNumber);
        }
    };

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
        handleSelect();
    };

    const getCharCountStatus = () => {
        if (!maxLength) return '';
        const remaining = maxLength - (value?.length || 0);
        if (remaining < 0) return 'error';
        if (remaining < 50) return 'warning';
        return '';
    };

    const sizeClass = size !== 'default' ? styles[size] : '';

    const terminalClasses = [
        styles.terminal,
        error ? styles.error : '',
        disabled ? styles.disabled : '',
        sizeClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.terminalWrapper}>
            <div className={terminalClasses}>
                {/* Terminal Header */}
                <div className={styles.terminalHeader}>
                    <div className={styles.windowControls}>
                        <span className={`${styles.windowDot} ${styles.red}`} />
                        <span className={`${styles.windowDot} ${styles.yellow}`} />
                        <span className={`${styles.windowDot} ${styles.green}`} />
                    </div>
                    <span className={styles.terminalTitle}>{title}</span>
                </div>

                {/* Input Area */}
                <div className={styles.inputArea}>
                    {/* Line Numbers */}
                    <div className={styles.lineNumbers}>
                        {Array.from({ length: lineCount }, (_, i) => (
                            <span
                                key={i + 1}
                                className={`${styles.lineNumber} ${currentLine === i + 1 ? styles.active : ''}`}
                            >
                                {i + 1}
                            </span>
                        ))}
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        value={value}
                        onChange={handleChange}
                        onSelect={handleSelect}
                        onClick={handleSelect}
                        onKeyUp={handleSelect}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        spellCheck={false}
                    />
                </div>

                {/* Terminal Footer */}
                <div className={styles.terminalFooter}>
                    <div className={styles.statusTag}>
                        <span className={styles.statusDot} />
                        <span>Ready</span>
                    </div>
                    {maxLength && (
                        <span className={`${styles.charCount} ${styles[getCharCountStatus()]}`}>
                            {value?.length || 0} / {maxLength}
                        </span>
                    )}
                    {!maxLength && (
                        <span className={styles.charCount}>
                            {value?.length || 0} chars | {lineCount} lines
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

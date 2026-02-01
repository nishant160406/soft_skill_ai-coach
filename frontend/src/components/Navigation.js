'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

/**
 * Navigation Component
 * Futuristic top navigation bar with neon styling
 */
export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard' },
        { href: '/session', label: 'Practice' },
        { href: '/results', label: 'Results' },
        { href: '/history', label: 'History' },
    ];

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <nav className={styles.nav}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className={styles.logoText}>
                        SKILL<span className={styles.logoAccent}>COACH</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <ul className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Right Side Actions */}
                <div className={styles.navActions}>
                    <div className={styles.statusIndicator}>
                        <span className={styles.statusDot} />
                        AI Online
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>
            <div className={styles.navSpacer} />
        </>
    );
}

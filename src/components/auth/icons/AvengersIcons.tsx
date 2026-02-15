import React from 'react';
import './AvengersIcons.scss';

export const ShieldIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`avengers-icon shield-icon ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
            fill="url(#shieldGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 8L9 11L11 13L12 12L15 15L17 13L12 8Z"
            fill="white"
            opacity="0.9"
        />
        <defs>
            <linearGradient id="shieldGradient" x1="3" y1="2" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#DC2626" />
                <stop offset="0.5" stopColor="#991B1B" />
                <stop offset="1" stopColor="#7F1D1D" />
            </linearGradient>
        </defs>
    </svg>
);

export const ArcReactorIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`avengers-icon arc-reactor-icon ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="9" fill="url(#arcGradient)" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="12" cy="12" r="3" fill="url(#arcCoreGradient)" />
        <path d="M12 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
            <linearGradient id="arcGradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#0891B2" />
            </linearGradient>
            <radialGradient id="arcCoreGradient" cx="12" cy="12" r="3" gradientUnits="userSpaceOnUse">
                <stop stopColor="#67E8F9" />
                <stop offset="1" stopColor="#06B6D4" />
            </radialGradient>
        </defs>
    </svg>
);

export const LightningIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`avengers-icon lightning-icon ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="url(#lightningGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <defs>
            <linearGradient id="lightningGradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FCD34D" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
            </linearGradient>
        </defs>
    </svg>
);

export const InfinityIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`avengers-icon infinity-icon ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M18.178 8C21.606 8 23.822 12 18.178 16C14.75 18.667 12.534 18.667 9.106 16C5.678 13.333 3.462 13.333 0.034 16C-5.61 12 -3.394 8 0.034 8C3.462 8 5.678 12 9.106 12C12.534 12 14.75 8 18.178 8Z"
            transform="translate(3, 6)"
            fill="url(#infinityGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <defs>
            <linearGradient id="infinityGradient" x1="0" y1="8" x2="18" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="0.5" stopColor="#9333EA" />
                <stop offset="1" stopColor="#7E22CE" />
            </linearGradient>
        </defs>
    </svg>
);

import React from 'react';
import './CopytradingIcons.scss';

export const NewCopytradingIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`copytrading-icon new-copytrading-icon ${className}`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Central core with pulsing energy */}
        <circle cx="24" cy="24" r="8" fill="url(#newCoreGradient)" className="core-pulse" />
        
        {/* Rotating outer ring */}
        <circle 
            cx="24" 
            cy="24" 
            r="16" 
            stroke="url(#newRingGradient)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="4 4"
            className="outer-ring"
        />
        
        {/* Orbiting particles */}
        <circle cx="40" cy="24" r="3" fill="#06b6d4" className="orbit-particle particle-1" />
        <circle cx="24" cy="8" r="3" fill="#3b82f6" className="orbit-particle particle-2" />
        <circle cx="8" cy="24" r="3" fill="#8b5cf6" className="orbit-particle particle-3" />
        <circle cx="24" cy="40" r="3" fill="#ec4899" className="orbit-particle particle-4" />
        
        {/* Energy beams */}
        <line x1="24" y1="24" x2="40" y2="24" stroke="url(#beamGradient)" strokeWidth="2" className="energy-beam beam-1" />
        <line x1="24" y1="24" x2="24" y2="8" stroke="url(#beamGradient)" strokeWidth="2" className="energy-beam beam-2" />
        <line x1="24" y1="24" x2="8" y2="24" stroke="url(#beamGradient)" strokeWidth="2" className="energy-beam beam-3" />
        <line x1="24" y1="24" x2="24" y2="40" stroke="url(#beamGradient)" strokeWidth="2" className="energy-beam beam-4" />
        
        {/* Inner rotating gears */}
        <g className="inner-gear">
            <circle cx="24" cy="24" r="12" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.6" />
            <line x1="24" y1="12" x2="24" y2="16" stroke="#06b6d4" strokeWidth="2" />
            <line x1="36" y1="24" x2="32" y2="24" stroke="#06b6d4" strokeWidth="2" />
            <line x1="24" y1="36" x2="24" y2="32" stroke="#06b6d4" strokeWidth="2" />
            <line x1="12" y1="24" x2="16" y2="24" stroke="#06b6d4" strokeWidth="2" />
        </g>
        
        <defs>
            <linearGradient id="newCoreGradient" x1="16" y1="16" x2="32" y2="32">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="newRingGradient" x1="8" y1="8" x2="40" y2="40">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
    </svg>
);

export const ClassicCopytradingIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`copytrading-icon classic-copytrading-icon ${className}`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Main document/clipboard base */}
        <rect x="10" y="8" width="28" height="32" rx="2" fill="url(#classicBgGradient)" stroke="#06b6d4" strokeWidth="2" />
        
        {/* Animated lines representing data */}
        <line x1="14" y1="16" x2="34" y2="16" stroke="#3b82f6" strokeWidth="2" className="data-line line-1" />
        <line x1="14" y1="22" x2="30" y2="22" stroke="#06b6d4" strokeWidth="2" className="data-line line-2" />
        <line x1="14" y1="28" x2="32" y2="28" stroke="#8b5cf6" strokeWidth="2" className="data-line line-3" />
        <line x1="14" y1="34" x2="28" y2="34" stroke="#3b82f6" strokeWidth="2" className="data-line line-4" />
        
        {/* Rotating copy indicator */}
        <g className="copy-indicator">
            <circle cx="38" cy="12" r="6" fill="url(#copyIndicatorGradient)" />
            <path d="M 36 12 L 38 14 L 42 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        
        {/* Mechanical gears */}
        <g className="mechanical-gear gear-1">
            <circle cx="18" cy="38" r="4" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
            <line x1="18" y1="34" x2="18" y2="36" stroke="#06b6d4" strokeWidth="1" />
            <line x1="22" y1="38" x2="20" y2="38" stroke="#06b6d4" strokeWidth="1" />
            <line x1="18" y1="42" x2="18" y2="40" stroke="#06b6d4" strokeWidth="1" />
            <line x1="14" y1="38" x2="16" y2="38" stroke="#06b6d4" strokeWidth="1" />
        </g>
        
        <g className="mechanical-gear gear-2">
            <circle cx="30" cy="38" r="4" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
            <line x1="30" y1="34" x2="30" y2="36" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="34" y1="38" x2="32" y2="38" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="30" y1="42" x2="30" y2="40" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="26" y1="38" x2="28" y2="38" stroke="#8b5cf6" strokeWidth="1" />
        </g>
        
        {/* Data flow arrows */}
        <path 
            d="M 20 12 L 24 8 L 28 12" 
            stroke="#06b6d4" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="flow-arrow"
        />
        
        <defs>
            <linearGradient id="classicBgGradient" x1="10" y1="8" x2="38" y2="40">
                <stop offset="0%" stopColor="rgba(15, 23, 42, 0.9)" />
                <stop offset="100%" stopColor="rgba(30, 41, 59, 0.9)" />
            </linearGradient>
            <radialGradient id="copyIndicatorGradient" cx="38" cy="12" r="6">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </radialGradient>
        </defs>
    </svg>
);

import React from 'react';
import './MysticalTraderIcon.scss';

interface MysticalTraderIconProps {
    width?: number;
    height?: number;
    animated?: boolean;
}

export const MysticalTraderIcon: React.FC<MysticalTraderIconProps> = ({ 
    width = 148, 
    height = 32,
    animated = true 
}) => {
    return (
        <div className={`mystical-trader-icon ${animated ? 'animated' : ''}`} style={{ width, height }}>
            <svg 
                viewBox="0 0 148 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mystical-svg"
            >
                <defs>
                    {/* Mystical glow gradient */}
                    <radialGradient id="mysticalGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
                    </radialGradient>
                    
                    {/* Energy gradient */}
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#4ECDC4" />
                    </linearGradient>

                    {/* Mechanical gradient */}
                    <linearGradient id="mechanicalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C0C0C0" />
                        <stop offset="50%" stopColor="#E8E8E8" />
                        <stop offset="100%" stopColor="#A0A0A0" />
                    </linearGradient>
                </defs>

                {/* Outer mystical circle */}
                <g className="outer-ring">
                    <circle 
                        cx="16" 
                        cy="16" 
                        r="14" 
                        stroke="url(#energyGradient)" 
                        strokeWidth="1.5" 
                        fill="none"
                        className="ring-1"
                    />
                    <circle 
                        cx="16" 
                        cy="16" 
                        r="12" 
                        stroke="url(#energyGradient)" 
                        strokeWidth="1" 
                        fill="none"
                        className="ring-2"
                        opacity="0.6"
                    />
                </g>

                {/* Rotating mechanical gears */}
                <g className="gear-system">
                    {/* Main central gear */}
                    <g className="main-gear" transform="translate(16, 16)">
                        {[...Array(8)].map((_, i) => {
                            const angle = (i * 45) * Math.PI / 180;
                            const x1 = Math.cos(angle) * 6;
                            const y1 = Math.sin(angle) * 6;
                            const x2 = Math.cos(angle) * 9;
                            const y2 = Math.sin(angle) * 9;
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="url(#mechanicalGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                        <circle cx="0" cy="0" r="5" fill="url(#mechanicalGradient)" />
                        <circle cx="0" cy="0" r="2" fill="#FFD700" className="core-glow" />
                    </g>

                    {/* Orbiting particles */}
                    {[0, 120, 240].map((offset, i) => (
                        <circle
                            key={i}
                            cx="16"
                            cy="16"
                            r="1.5"
                            fill="#4ECDC4"
                            className={`particle particle-${i + 1}`}
                            style={{ transformOrigin: '16px 16px' }}
                        />
                    ))}
                </g>

                {/* Mystical runes/symbols */}
                <g className="runes">
                    {[0, 90, 180, 270].map((angle, i) => {
                        const rad = angle * Math.PI / 180;
                        const x = 16 + Math.cos(rad) * 11;
                        const y = 16 + Math.sin(rad) * 11;
                        return (
                            <g key={i} className={`rune rune-${i + 1}`}>
                                <circle cx={x} cy={y} r="1.5" fill="#FFD700" opacity="0.8" />
                                <circle cx={x} cy={y} r="2.5" stroke="#FFD700" strokeWidth="0.5" fill="none" opacity="0.4" />
                            </g>
                        );
                    })}
                </g>

                {/* Energy arcs */}
                <g className="energy-arcs">
                    <path
                        d="M 8 16 Q 12 8, 16 16"
                        stroke="#4ECDC4"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.6"
                        className="arc-1"
                    />
                    <path
                        d="M 16 16 Q 20 24, 24 16"
                        stroke="#FF6B35"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.6"
                        className="arc-2"
                    />
                </g>

                {/* Text: DTRADER */}
                <text
                    x="38"
                    y="20"
                    fontFamily="'Inter', 'Segoe UI', sans-serif"
                    fontSize="14"
                    fontWeight="700"
                    fill="url(#energyGradient)"
                    className="trader-text"
                >
                    DTRADER
                </text>

                {/* Decorative mechanical elements around text */}
                <g className="text-decoration">
                    <line x1="36" y1="24" x2="110" y2="24" stroke="url(#mechanicalGradient)" strokeWidth="0.5" opacity="0.4" />
                    <line x1="36" y1="10" x2="110" y2="10" stroke="url(#mechanicalGradient)" strokeWidth="0.5" opacity="0.4" />
                    
                    {/* Small gears near text */}
                    <g className="small-gear-1" transform="translate(112, 12)">
                        <circle r="3" fill="none" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                        <line x1="-2" y1="0" x2="2" y2="0" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                        <line x1="0" y1="-2" x2="0" y2="2" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                    </g>
                    
                    <g className="small-gear-2" transform="translate(112, 20)">
                        <circle r="2.5" fill="none" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                        <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                        <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="url(#mechanicalGradient)" strokeWidth="0.8" />
                    </g>
                </g>

                {/* Mystical portal effect behind icon */}
                <circle 
                    cx="16" 
                    cy="16" 
                    r="15" 
                    fill="url(#mysticalGlow)" 
                    opacity="0.2"
                    className="portal-glow"
                />
            </svg>
        </div>
    );
};

export default MysticalTraderIcon;

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
                    {/* Modern gradient for D shape */}
                    <linearGradient id="dGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0066FF" />
                        <stop offset="50%" stopColor="#00A8FF" />
                        <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                    
                    {/* Glow effect */}
                    <radialGradient id="dGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
                    </radialGradient>

                    {/* Chart line gradient */}
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00FF88" />
                        <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                </defs>

                {/* Background glow */}
                <circle 
                    cx="16" 
                    cy="16" 
                    r="14" 
                    fill="url(#dGlow)" 
                    opacity="0.3"
                    className="d-glow"
                />

                {/* Main D shape */}
                <g className="d-shape">
                    {/* D letter path - clean and bold */}
                    <path
                        d="M 6 6 L 6 26 L 16 26 C 22 26 26 22 26 16 C 26 10 22 6 16 6 Z M 9 9 L 16 9 C 20 9 23 12 23 16 C 23 20 20 23 16 23 L 9 23 Z"
                        fill="url(#dGradient)"
                        className="d-letter"
                    />
                    
                    {/* Inner glow */}
                    <path
                        d="M 9 9 L 16 9 C 20 9 23 12 23 16 C 23 20 20 23 16 23 L 9 23 Z"
                        fill="none"
                        stroke="#00D4FF"
                        strokeWidth="0.5"
                        opacity="0.6"
                        className="d-inner-glow"
                    />
                </g>

                {/* Trading chart line inside D */}
                <g className="chart-line">
                    <polyline
                        points="11,16 13,14 15,17 17,13 19,15 21,12"
                        stroke="url(#chartGradient)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="chart-path"
                    />
                    
                    {/* Data points */}
                    {[
                        { x: 11, y: 16 },
                        { x: 13, y: 14 },
                        { x: 15, y: 17 },
                        { x: 17, y: 13 },
                        { x: 19, y: 15 },
                        { x: 21, y: 12 }
                    ].map((point, i) => (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="1"
                            fill="#00FF88"
                            className={`data-point data-point-${i + 1}`}
                        />
                    ))}
                </g>

                {/* Orbiting particles around D */}
                <g className="particles">
                    {[0, 120, 240].map((angle, i) => (
                        <circle
                            key={i}
                            cx="16"
                            cy="16"
                            r="1.2"
                            fill="#00D4FF"
                            className={`particle particle-${i + 1}`}
                            style={{ transformOrigin: '16px 16px' }}
                        />
                    ))}
                </g>

                {/* Text: TRADER */}
                <text
                    x="38"
                    y="20"
                    fontFamily="'Inter', 'Segoe UI', sans-serif"
                    fontSize="14"
                    fontWeight="700"
                    fill="url(#dGradient)"
                    className="trader-text"
                >
                    TRADER
                </text>

                {/* Decorative elements */}
                <g className="decorations">
                    {/* Top line with pulse */}
                    <line 
                        x1="36" 
                        y1="10" 
                        x2="95" 
                        y2="10" 
                        stroke="url(#chartGradient)" 
                        strokeWidth="0.5" 
                        opacity="0.5"
                        className="deco-line-top"
                    />
                    
                    {/* Bottom line with pulse */}
                    <line 
                        x1="36" 
                        y1="24" 
                        x2="95" 
                        y2="24" 
                        stroke="url(#chartGradient)" 
                        strokeWidth="0.5" 
                        opacity="0.5"
                        className="deco-line-bottom"
                    />
                    
                    {/* Small chart indicators */}
                    <g className="mini-chart" transform="translate(100, 16)">
                        <polyline
                            points="0,2 2,0 4,3 6,-1"
                            stroke="#00FF88"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap="round"
                            className="mini-chart-line"
                        />
                    </g>
                </g>

                {/* Pulse ring around D */}
                <circle 
                    cx="16" 
                    cy="16" 
                    r="13" 
                    stroke="url(#dGradient)" 
                    strokeWidth="0.5" 
                    fill="none"
                    opacity="0.4"
                    className="pulse-ring"
                />
            </svg>
        </div>
    );
};

export default MysticalTraderIcon;

import React, { useEffect, useRef, useState } from 'react';
import './TraderMasterLoader.scss';

interface TraderMasterLoaderProps {
    onLoadComplete?: () => void;
    duration?: number;
}

export const TraderMasterLoader: React.FC<TraderMasterLoaderProps> = ({ 
    onLoadComplete, 
    duration = 5000 
}) => {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showLogo, setShowLogo] = useState(false);
    const globeRef = useRef<HTMLCanvasElement>(null);

    const statuses = [
        "Connecting to Global Markets...",
        "Synchronizing Trading Networks...",
        "Loading Market Intelligence...",
        "Establishing Trade Routes...",
        "GLOBALTRADES Ready!"
    ];

    // Globe with Trading Routes Animation
    useEffect(() => {
        const canvas = globeRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let rotation = 0;
        let animationFrame: number;

        // Major trading cities coordinates (latitude, longitude)
        const tradingHubs = [
            { name: 'New York', lat: 40.7128, lon: -74.0060, color: '#00D4FF' },
            { name: 'London', lat: 51.5074, lon: -0.1278, color: '#00FF88' },
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: '#FF6B6B' },
            { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, color: '#FFD93D' },
            { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#A78BFA' },
            { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, color: '#FB923C' },
            { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#34D399' },
        ];

        // Trade routes (connections between hubs)
        const tradeRoutes = [
            [0, 1], [1, 2], [2, 4], [4, 3], [3, 0], [1, 5], [4, 6], [0, 2]
        ];

        // Candlestick data points
        const candlesticks: Array<{
            x: number;
            y: number;
            open: number;
            close: number;
            high: number;
            low: number;
            opacity: number;
        }> = [];

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 180;
            candlesticks.push({
                x: canvas.width / 2 + Math.cos(angle) * radius,
                y: canvas.height / 2 + Math.sin(angle) * radius,
                open: Math.random() * 20 + 10,
                close: Math.random() * 20 + 10,
                high: Math.random() * 10 + 30,
                low: Math.random() * 10,
                opacity: 0.6 + Math.random() * 0.4
            });
        }

        // Convert lat/lon to 3D coordinates
        const latLonTo3D = (lat: number, lon: number, radius: number, rot: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + rot) * (Math.PI / 180);
            
            return {
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.cos(phi),
                z: radius * Math.sin(phi) * Math.sin(theta)
            };
        };

        // Project 3D to 2D
        const project3D = (x: number, y: number, z: number) => {
            const scale = 300 / (300 + z);
            return {
                x: canvas.width / 2 + x * scale,
                y: canvas.height / 2 - y * scale,
                scale: scale,
                visible: z > -150
            };
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            rotation += 0.3;

            // Draw globe wireframe
            const globeRadius = 120;
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
            ctx.lineWidth = 1;

            // Latitude lines
            for (let lat = -60; lat <= 60; lat += 30) {
                ctx.beginPath();
                for (let lon = 0; lon <= 360; lon += 5) {
                    const pos3D = latLonTo3D(lat, lon, globeRadius, rotation);
                    const pos2D = project3D(pos3D.x, pos3D.y, pos3D.z);
                    
                    if (lon === 0) {
                        ctx.moveTo(pos2D.x, pos2D.y);
                    } else {
                        ctx.lineTo(pos2D.x, pos2D.y);
                    }
                }
                ctx.stroke();
            }

            // Longitude lines
            for (let lon = 0; lon < 360; lon += 30) {
                ctx.beginPath();
                for (let lat = -90; lat <= 90; lat += 5) {
                    const pos3D = latLonTo3D(lat, lon, globeRadius, rotation);
                    const pos2D = project3D(pos3D.x, pos3D.y, pos3D.z);
                    
                    if (lat === -90) {
                        ctx.moveTo(pos2D.x, pos2D.y);
                    } else {
                        ctx.lineTo(pos2D.x, pos2D.y);
                    }
                }
                ctx.stroke();
            }

            // Draw trading hubs
            const hubPositions = tradingHubs.map(hub => {
                const pos3D = latLonTo3D(hub.lat, hub.lon, globeRadius, rotation);
                const pos2D = project3D(pos3D.x, pos3D.y, pos3D.z);
                return { ...hub, ...pos2D };
            });

            // Draw trade routes
            tradeRoutes.forEach(([from, to]) => {
                const fromHub = hubPositions[from];
                const toHub = hubPositions[to];
                
                if (fromHub.visible && toHub.visible) {
                    const gradient = ctx.createLinearGradient(
                        fromHub.x, fromHub.y, toHub.x, toHub.y
                    );
                    gradient.addColorStop(0, fromHub.color);
                    gradient.addColorStop(1, toHub.color);
                    
                    ctx.beginPath();
                    ctx.moveTo(fromHub.x, fromHub.y);
                    ctx.lineTo(toHub.x, toHub.y);
                    ctx.strokeStyle = gradient;
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });

            // Draw hubs
            hubPositions.forEach(hub => {
                if (hub.visible) {
                    // Outer glow
                    const gradient = ctx.createRadialGradient(
                        hub.x, hub.y, 0,
                        hub.x, hub.y, 15 * hub.scale
                    );
                    gradient.addColorStop(0, hub.color);
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = 0.4;
                    ctx.beginPath();
                    ctx.arc(hub.x, hub.y, 15 * hub.scale, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Inner dot
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = hub.color;
                    ctx.beginPath();
                    ctx.arc(hub.x, hub.y, 4 * hub.scale, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Pulse ring
                    ctx.strokeStyle = hub.color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    ctx.arc(hub.x, hub.y, (8 + Math.sin(Date.now() / 500) * 3) * hub.scale, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });

            // Draw candlesticks around the globe
            candlesticks.forEach((candle, i) => {
                const angle = (i / candlesticks.length) * Math.PI * 2 + rotation / 50;
                const radius = 200;
                candle.x = canvas.width / 2 + Math.cos(angle) * radius;
                candle.y = canvas.height / 2 + Math.sin(angle) * radius;

                const isGreen = candle.close > candle.open;
                ctx.fillStyle = isGreen ? 'rgba(0, 255, 136, 0.7)' : 'rgba(255, 107, 107, 0.7)';
                ctx.strokeStyle = isGreen ? '#00FF88' : '#FF6B6B';
                ctx.lineWidth = 2;

                // High-Low line
                ctx.beginPath();
                ctx.moveTo(candle.x, candle.y - candle.high);
                ctx.lineTo(candle.x, candle.y - candle.low);
                ctx.stroke();

                // Body
                const bodyHeight = Math.abs(candle.close - candle.open);
                const bodyY = candle.y - Math.max(candle.open, candle.close);
                ctx.fillRect(candle.x - 4, bodyY, 8, bodyHeight);
                ctx.strokeRect(candle.x - 4, bodyY, 8, bodyHeight);
            });

            // Draw data streams
            for (let i = 0; i < 3; i++) {
                const streamAngle = (i / 3) * Math.PI * 2 + rotation / 30;
                const streamRadius = 250;
                const streamX = canvas.width / 2 + Math.cos(streamAngle) * streamRadius;
                const streamY = canvas.height / 2 + Math.sin(streamAngle) * streamRadius;

                ctx.font = '10px monospace';
                ctx.fillStyle = '#00D4FF';
                ctx.globalAlpha = 0.6;
                ctx.fillText('$' + (Math.random() * 1000).toFixed(2), streamX, streamY);
                ctx.globalAlpha = 1;
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    // Logo reveal animation
    useEffect(() => {
        const logoTimer = setTimeout(() => {
            setShowLogo(true);
        }, 300);

        return () => clearTimeout(logoTimer);
    }, []);

    // Progress and Status Updates
    useEffect(() => {
        const statusInterval = duration / statuses.length;
        const progressInterval = 30;
        const progressIncrement = 100 / (duration / progressInterval);

        const progressTimer = setInterval(() => {
            setProgress(prev => {
                const next = prev + progressIncrement;
                return next >= 100 ? 100 : next;
            });
        }, progressInterval);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => {
                if (prev < statuses.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, statusInterval);

        const completeTimer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => {
                if (onLoadComplete) {
                    onLoadComplete();
                }
            }, 800);
        }, duration);

        return () => {
            clearInterval(progressTimer);
            clearInterval(statusTimer);
            clearTimeout(completeTimer);
        };
    }, [duration, onLoadComplete, statuses.length]);

    return (
        <div className={`tradermaster-loader ${isComplete ? 'fade-out' : ''}`}>
            <canvas ref={globeRef} className="globe-canvas" />
            
            <div className="loader-content">
                {/* Animated Logo */}
                <div className={`logo-container ${showLogo ? 'show' : ''}`}>
                    <div className="logo-wrapper">
                        <div className="logo-icon">
                            <div className="globe-icon">
                                <div className="globe-ring"></div>
                                <div className="globe-ring-2"></div>
                                <div className="globe-core"></div>
                            </div>
                        </div>
                        <h1 className="logo-text">
                            <span className="global">GLOBAL</span>
                            <span className="trades">TRADES</span>
                        </h1>
                    </div>
                    <p className="tagline">Connecting Global Markets</p>
                </div>

                {/* Modern Progress Ring */}
                <div className="progress-ring-container">
                    <svg className="progress-ring" width="120" height="120">
                        <circle
                            className="progress-ring-background"
                            cx="60"
                            cy="60"
                            r="54"
                            fill="transparent"
                            stroke="#1a2332"
                            strokeWidth="4"
                        />
                        <circle
                            className="progress-ring-fill"
                            cx="60"
                            cy="60"
                            r="54"
                            fill="transparent"
                            stroke="#00D4FF"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                        />
                    </svg>
                    <div className="progress-percentage">{Math.round(progress)}%</div>
                </div>

                {/* Status Text */}
                <div className="status-container">
                    <p className="status-text">{statuses[statusIndex]}</p>
                </div>

                {/* Loading Dots */}
                <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    );
};

export default TraderMasterLoader;
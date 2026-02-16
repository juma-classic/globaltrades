import React, { useState, useEffect } from 'react';
import './RiskDisclaimer.scss';

const RiskDisclaimer: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('risk_disclaimer_dismissed') === 'true';
    });

    useEffect(() => {
        // Detect mobile on mount and resize
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('risk_disclaimer_dismissed', 'true');
        setIsDismissed(true);
    };

    const handleToggle = () => {
        setIsMinimized(!isMinimized);
    };

    if (isDismissed) {
        return null;
    }

    return (
        <div className={`risk-disclaimer ${isMinimized ? 'minimized' : ''} ${isMobile ? 'mobile' : ''}`}>
            {!isMinimized ? (
                <div className='risk-disclaimer__content'>
                    <div className='risk-disclaimer__header'>
                        <div className='header-left'>
                            <span className='icon'>⚠️</span>
                            <span className='title'>Risk Warning</span>
                        </div>
                        <div className='header-actions'>
                            <button className='btn-minimize' onClick={handleToggle} title='Minimize'>
                                −
                            </button>
                            <button className='btn-close' onClick={handleDismiss} title='Dismiss'>
                                ×
                            </button>
                        </div>
                    </div>
                    <div className='risk-disclaimer__body'>
                        <p>
                            {isMobile 
                                ? 'Trading carries high risk. Only trade with money you can afford to lose.'
                                : 'Trading derivatives carries a high level of risk to your capital. You should only trade with money you can afford to lose. Past performance is not indicative of future results. This platform is for educational and informational purposes only.'
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className='risk-disclaimer__minimized' onClick={handleToggle}>
                    <span className='icon'>⚠️</span>
                    <span className='text'>Risk</span>
                </div>
            )}
        </div>
    );
};

export default RiskDisclaimer;

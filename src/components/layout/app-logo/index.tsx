import { useEffect, useRef, useState } from 'react';
import { standalone_routes } from '@/components/shared';
import { isAdmin } from '@/utils/admin-check';
import { fakeRealBalanceGenerator } from '@/utils/fake-real-balance-generator';
import { simulationActivation } from '@/utils/simulation-activation';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();
    const [pressProgress, setPressProgress] = useState(0);
    const [showGreenBlink, setShowGreenBlink] = useState(false);
    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const logoRef = useRef<HTMLDivElement>(null);

    const PRESS_DURATION = 3000; // 3 seconds
    const PROGRESS_UPDATE_INTERVAL = 50; // Update every 50ms for smooth animation

    useEffect(() => {
        // Setup simulation activation callback
        simulationActivation.onActivation(() => {
            // Show green blink for 2 seconds
            setShowGreenBlink(true);
            setTimeout(() => {
                setShowGreenBlink(false);
            }, 2000);
        });

        // Setup logo tap listener for mobile
        if (logoRef.current) {
            simulationActivation.setupLogoTapListener(logoRef.current);
        }

        return () => {
            // Cleanup on unmount
            if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
        // Only work for admin users
        if (!isAdmin()) return;

        e.preventDefault();
        e.stopPropagation();

        startTimeRef.current = Date.now();
        setPressProgress(0);

        // Update progress bar smoothly
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
            setPressProgress(progress);
        }, PROGRESS_UPDATE_INTERVAL);

        // Activate fake real mode after 3 seconds
        pressTimerRef.current = setTimeout(() => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            
            // Toggle fake real mode
            const currentMode = localStorage.getItem('demo_icon_us_flag') === 'true';
            const newMode = !currentMode;
            
            localStorage.setItem('demo_icon_us_flag', newMode.toString());
            localStorage.setItem('fake_real_mode_acknowledged', 'true');

            // Generate new balances when enabling fake mode
            if (newMode) {
                fakeRealBalanceGenerator.generateNewBalances();
                console.log('🎭 Fake Real Mode ACTIVATED');
            } else {
                // Clear balances when disabling fake mode
                fakeRealBalanceGenerator.clearStoredBalances();
                console.log('✅ Fake Real Mode DEACTIVATED');
            }

            // Visual feedback
            setPressProgress(100);

            // Reload to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 300);
        }, PRESS_DURATION);
    };

    const handlePressEnd = () => {
        // Clear timers and reset progress
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        
        // Fade out progress bar
        setTimeout(() => {
            setPressProgress(0);
        }, 200);
    };

    const logoContent = (
        <div 
            ref={logoRef}
            className={`globaltrades-logo-wrapper ${showGreenBlink ? 'simulation-blink' : ''}`}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            style={{ position: 'relative', userSelect: 'none' }}
        >
            <span className='globaltrades-text'>
                {isDesktop ? 'GLOBALTRADES' : 'GT'}
            </span>
            {pressProgress > 0 && (
                <div 
                    className='press-progress-bar'
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '3px',
                        width: `${pressProgress}%`,
                        background: 'linear-gradient(90deg, #00D4FF, #00FF88)',
                        transition: pressProgress === 100 ? 'none' : 'width 0.05s linear',
                        borderRadius: '2px',
                        boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
                    }}
                />
            )}
        </div>
    );

    if (!isDesktop) {
        return (
            <a href={standalone_routes.traders_hub} className='app-header__logo globaltrades-logo mobile-logo'>
                {logoContent}
            </a>
        );
    }

    return (
        <a
            href='https://www.globaltrades.site/'
            target='_blank'
            rel='noopener noreferrer'
            className='app-header__logo globaltrades-logo'
        >
            {logoContent}
        </a>
    );
};

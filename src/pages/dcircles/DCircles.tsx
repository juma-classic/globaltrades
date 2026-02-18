import React, { useState, useEffect, useRef } from 'react';
import './DCircles.scss';

interface TickData {
    time: number;
    quote: number;
}

interface ContractState {
    isActive: boolean;
    barrier: number | null;
    entryDigit: number | null;
    exitDigit: number | null;
    isWin: boolean | null;
    digitsAboveBarrier: number[];
}

export const DCircles: React.FC = () => {
    const [ticks, setTicks] = useState<TickData[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState('R_10');
    const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [pipSize, setPipSize] = useState(2);
    const [totalTicks, setTotalTicks] = useState(1000);
    const [patternView, setPatternView] = useState<'evenodd' | 'overunder'>('evenodd');
    const [isConnecting, setIsConnecting] = useState(true);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [contractState, setContractState] = useState<ContractState>({
        isActive: false,
        barrier: null,
        entryDigit: null,
        exitDigit: null,
        isWin: null,
        digitsAboveBarrier: []
    });
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [selectedSymbol]);

    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=115423');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('✅ DCircles WebSocket connected');
            setIsConnecting(false);
            setConnectionError(null);
            ws.send(JSON.stringify({
                ticks_history: selectedSymbol,
                count: 1000,
                end: 'latest',
                style: 'ticks',
                subscribe: 1
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📊 DCircles received data:', data);

            if (data.history) {
                const tickData = data.history.prices.map((price: string, index: number) => ({
                    time: data.history.times[index],
                    quote: parseFloat(price)
                }));
                console.log('📈 Setting ticks:', tickData.length, 'ticks');
                setTicks(tickData);
                if (tickData.length > 0) {
                    setCurrentPrice(tickData[tickData.length - 1].quote);
                }
                if (data.pip_size !== undefined) {
                    setPipSize(data.pip_size);
                }
            } else if (data.tick) {
                const newTick = {
                    time: data.tick.epoch,
                    quote: parseFloat(data.tick.quote)
                };
                setTicks(prev => [...prev.slice(-999), newTick]);
                setCurrentPrice(newTick.quote);
                if (data.tick.pip_size !== undefined) {
                    setPipSize(data.tick.pip_size);
                }
            } else if (data.error) {
                console.error('❌ DCircles WebSocket error:', data.error);
                setConnectionError(data.error.message || 'Connection error');
                setIsConnecting(false);
            }
        };

        ws.onerror = (error) => {
            console.error('❌ DCircles WebSocket connection error:', error);
            setConnectionError('Failed to connect to market data');
            setIsConnecting(false);
        };

        ws.onclose = () => {
            console.log('🔌 DCircles WebSocket disconnected');
            setIsConnecting(false);
        };
    };

    const getLastDigit = (price: number): number => {
        return parseInt(price.toFixed(pipSize).slice(-1), 10);
    };

    // Contract simulation functions
    const simulateContractPurchase = (barrier: number) => {
        const entryDigit = currentPrice ? getLastDigit(currentPrice) : null;
        const digitsAbove = [];
        
        // Find all digits above the barrier
        for (let i = 0; i <= 9; i++) {
            if (i > barrier) {
                digitsAbove.push(i);
            }
        }

        setContractState({
            isActive: true,
            barrier,
            entryDigit,
            exitDigit: null,
            isWin: null,
            digitsAboveBarrier: digitsAbove
        });
    };

    const simulateContractExit = (exitPrice: number, barrier: number) => {
        const exitDigit = getLastDigit(exitPrice);
        const isWin = exitDigit > barrier;

        setContractState(prev => ({
            ...prev,
            isActive: false,
            exitDigit,
            isWin,
            digitsAboveBarrier: [] // Clear soft glow
        }));

        // Auto-reset after 3 seconds
        setTimeout(() => {
            setContractState({
                isActive: false,
                barrier: null,
                entryDigit: null,
                exitDigit: null,
                isWin: null,
                digitsAboveBarrier: []
            });
        }, 3000);
    };

    const digitDistribution = (() => {
        if (ticks.length === 0) return Array(10).fill(0);
        
        const counts = Array(10).fill(0);
        ticks.forEach(tick => {
            const digit = getLastDigit(tick.quote);
            counts[digit]++;
        });
        return counts.map(count => (count / ticks.length) * 100);
    })();

    const currentDigit = currentPrice ? getLastDigit(currentPrice) : null;
    const maxPercent = digitDistribution.length > 0 ? Math.max(...digitDistribution) : 0;
    const minPercent = digitDistribution.length > 0 ? Math.min(...digitDistribution.filter(p => p > 0)) : 0;

    const evenOddStats = (() => {
        if (ticks.length === 0) return { even: 0, odd: 0 };
        
        let even = 0, odd = 0;
        ticks.forEach(tick => {
            const digit = getLastDigit(tick.quote);
            if (digit % 2 === 0) even++;
            else odd++;
        });
        const total = ticks.length;
        return {
            even: (even / total) * 100,
            odd: (odd / total) * 100
        };
    })();

    const risesFallsStats = (() => {
        if (ticks.length < 2) return { rises: 0, falls: 0 };
        
        let rises = 0, falls = 0;
        for (let i = 1; i < ticks.length; i++) {
            if (ticks[i].quote > ticks[i - 1].quote) rises++;
            else if (ticks[i].quote < ticks[i - 1].quote) falls++;
        }
        const total = ticks.length - 1;
        return {
            rises: (rises / total) * 100,
            falls: (falls / total) * 100
        };
    })();

    const last50Digits = ticks.slice(-50).map(tick => getLastDigit(tick.quote));

    const showMoreDigits = () => {
        // Show more digits in the stream
        console.log('Show more digits');
    };

    return (
        <div className="dcircles-container">
            {isConnecting && (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--status-warning)', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}>
                    Connecting to market data...
                </div>
            )}
            {connectionError && (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--status-danger)', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}>
                    {connectionError} - Check console for details
                </div>
            )}
            <div className="dcircles-header">
                <div className="price-display">
                    <div className="current-price">{currentPrice ? currentPrice.toFixed(pipSize) : 'N/A'}</div>
                    <div className="price-label">Current Price</div>
                </div>
                <div className="market-selector">
                    <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)}>
                        <option value="R_10">Volatility 10 Index</option>
                        <option value="R_25">Volatility 25 Index</option>
                        <option value="R_50">Volatility 50 Index</option>
                        <option value="R_75">Volatility 75 Index</option>
                        <option value="R_100">Volatility 100 Index</option>
                        <option value="1HZ10V">Volatility 10 (1s) Index</option>
                        <option value="1HZ25V">Volatility 25 (1s) Index</option>
                        <option value="1HZ50V">Volatility 50 (1s) Index</option>
                        <option value="1HZ75V">Volatility 75 (1s) Index</option>
                        <option value="1HZ100V">Volatility 100 (1s) Index</option>
                        <option value="1HZ150V">Volatility 150 (1s) Index</option>
                        <option value="1HZ250V">Volatility 250 (1s) Index</option>
                        <option value="1HZ300V">Volatility 300 (1s) Index</option>
                    </select>
                    <div className="selector-label">MARKET</div>
                </div>
            </div>

            <section className="analysis-section">
                <h2>Digit Distribution</h2>
                <div className="digit-grid">
                    {digitDistribution.map((percent, digit) => {
                        const isLowest = percent === minPercent && percent > 0;
                        const isHighest = percent === maxPercent && percent > 0;
                        const progress = maxPercent > 0 ? (percent / maxPercent) * 100 : 0;

                        // Determine glow state for this digit
                        const isAboveBarrier = contractState.isActive && contractState.digitsAboveBarrier.includes(digit);
                        const isExitWin = contractState.exitDigit === digit && contractState.isWin === true;
                        const isExitLoss = contractState.exitDigit === digit && contractState.isWin === false;

                        return (
                            <div key={digit} className="digit-container">
                                {digit === currentDigit && (
                                    <div className="current-indicator">
                                        <svg width="10" height="8" viewBox="0 0 20 16" fill="none">
                                            <path d="M10 16L0 0H20L10 16Z" fill="#fbbf24"/>
                                        </svg>
                                    </div>
                                )}
                                <div className={`digit-circle-wrapper ${isAboveBarrier ? 'glow-soft-green' : ''} ${isExitWin ? 'glow-sharp-green' : ''} ${isExitLoss ? 'glow-sharp-red' : ''}`}>
                                    <div className="digit-circle">
                                        <svg className="progress-ring" viewBox="0 0 64 64">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                fill="none"
                                                stroke="rgba(200,200,200,0.3)"
                                                strokeWidth="4"
                                            />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                fill="none"
                                                stroke={isLowest ? '#ef4444' : isHighest ? '#10b981' : '#4b5563'}
                                                strokeWidth="4"
                                                strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 32 32)"
                                            />
                                        </svg>
                                        <div className="digit-content">
                                            <div className={`digit-number ${isLowest ? 'lowest' : isHighest ? 'highest' : ''}`}>
                                                {digit}
                                            </div>
                                            <div className={`digit-percentage ${isLowest ? 'lowest' : isHighest ? 'highest' : ''}`}>
                                                {percent.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="analysis-stats">
                    Highest: <span className="stat-highest">{maxPercent.toFixed(2)}%</span> | 
                    Lowest: <span className="stat-lowest">{minPercent.toFixed(2)}%</span>
                </div>
            </section>

            <section className="analysis-section">
                <div className="section-header-with-toggle">
                    <h2>Pattern Analysis</h2>
                    <div className="toggle-buttons">
                        <button 
                            className={`toggle-btn ${patternView === 'evenodd' ? 'active' : ''}`}
                            onClick={() => setPatternView('evenodd')}
                        >
                            Even/Odd
                        </button>
                        <button 
                            className={`toggle-btn ${patternView === 'overunder' ? 'active' : ''}`}
                            onClick={() => setPatternView('overunder')}
                        >
                            Over/Under
                        </button>
                    </div>
                </div>
                
                {patternView === 'evenodd' ? (
                    <>
                        <div className="eo-grid">
                            <div className="stat-card even">
                                <div className="stat-value">{evenOddStats.even.toFixed(1)}%</div>
                                <div className="stat-label">Even</div>
                            </div>
                            <div className="stat-card odd">
                                <div className="stat-value">{evenOddStats.odd.toFixed(1)}%</div>
                                <div className="stat-label">Odd</div>
                            </div>
                        </div>
                        <div className="last-digits-pattern">
                            <div className="pattern-label">Last 50 Digits Pattern</div>
                            <div className="digits-stream-mini">
                                {last50Digits.map((digit, idx) => (
                                    <span key={idx} className={`digit-badge ${digit % 2 === 0 ? 'even' : 'odd'}`}>
                                        {digit % 2 === 0 ? 'E' : 'O'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="digit-selector">
                            <div className="selector-label-small">SELECT A DIGIT TO ANALYZE:</div>
                            <div className="digit-buttons">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                                    <button
                                        key={d}
                                        className={`digit-btn ${selectedDigit === d ? 'selected' : ''}`}
                                        onClick={() => setSelectedDigit(d)}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overunder-grid">
                            <div className="stat-card over">
                                <div className="stat-value">
                                    {(() => {
                                        const compareDigit = selectedDigit !== null ? selectedDigit : 4;
                                        let over = 0;
                                        ticks.forEach(tick => {
                                            const digit = getLastDigit(tick.quote);
                                            if (digit > compareDigit) over++;
                                        });
                                        return ((over / ticks.length) * 100).toFixed(1);
                                    })()}%
                                </div>
                                <div className="stat-label">Over {selectedDigit !== null ? selectedDigit : 4}</div>
                            </div>
                            {selectedDigit !== null && (
                                <div className="stat-card equal">
                                    <div className="stat-value">
                                        {(() => {
                                            let equal = 0;
                                            ticks.forEach(tick => {
                                                const digit = getLastDigit(tick.quote);
                                                if (digit === selectedDigit) equal++;
                                            });
                                            return ((equal / ticks.length) * 100).toFixed(1);
                                        })()}%
                                    </div>
                                    <div className="stat-label">Equal to {selectedDigit}</div>
                                </div>
                            )}
                            <div className="stat-card under">
                                <div className="stat-value">
                                    {(() => {
                                        const compareDigit = selectedDigit !== null ? selectedDigit : 4;
                                        let under = 0;
                                        ticks.forEach(tick => {
                                            const digit = getLastDigit(tick.quote);
                                            if (digit < compareDigit) under++;
                                        });
                                        return ((under / ticks.length) * 100).toFixed(1);
                                    })()}%
                                </div>
                                <div className="stat-label">Under {selectedDigit !== null ? selectedDigit : 4}</div>
                            </div>
                        </div>
                        <div className="last-digits-pattern">
                            <div className="pattern-label">
                                Last 50 Digits Pattern {selectedDigit !== null ? `(vs ${selectedDigit})` : '(vs 4)'}
                            </div>
                            <div className="digits-stream-mini">
                                {last50Digits.map((digit, idx) => {
                                    const compareDigit = selectedDigit !== null ? selectedDigit : 4;
                                    let badgeClass = 'under';
                                    if (digit > compareDigit) badgeClass = 'over';
                                    else if (digit === compareDigit) badgeClass = 'equal';
                                    return (
                                        <span key={idx} className={`digit-badge ${badgeClass}`}>
                                            {digit}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className="analysis-section">
                <h2>Market Movement</h2>
                <div className="eo-grid">
                    <div className="stat-card rise">
                        <div className="stat-value">{risesFallsStats.rises.toFixed(1)}%</div>
                        <div className="stat-label">RISE</div>
                    </div>
                    <div className="stat-card fall">
                        <div className="stat-value">{risesFallsStats.falls.toFixed(1)}%</div>
                        <div className="stat-label">FALL</div>
                    </div>
                </div>
            </section>

            <section className="analysis-section">
                <h2>Last Digits Stream</h2>
                <div className="stream-header">
                    <div className="stream-label">LATEST DIGITS (IN REVERSE)</div>
                </div>
                <div className="digits-stream">
                    {ticks.slice(-100).reverse().map((tick, idx) => {
                        const digit = getLastDigit(tick.quote);
                        return (
                            <span key={idx} className={`digit-badge ${digit % 2 === 0 ? 'even' : 'odd'}`}>
                                {digit}
                            </span>
                        );
                    })}
                </div>
                <button className="show-more-btn" onClick={showMoreDigits}>
                    Show More Digits
                </button>
            </section>

            <section className="analysis-section">
                <h2>Statistics</h2>
                <div className="statistics-grid">
                    <div className="stat-item">
                        <span className="stat-item-label">Total Ticks</span>
                        <span className="stat-item-value">{ticks.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-item-label">Pip Size</span>
                        <span className="stat-item-value">{pipSize}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DCircles;

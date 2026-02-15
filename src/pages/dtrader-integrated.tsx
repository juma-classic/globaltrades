import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { api_base } from '@/external/bot-skeleton';
import { TradingPanel } from '@/components/trading/TradingPanel';
import ChunkLoader from '@/components/loader/chunk-loader';
import { localize } from '@deriv-com/translations';
import './dtrader-integrated.scss';

const Chart = lazy(() => import('./chart/chart'));

/**
 * Integrated DTrader Component
 *
 * Chart and interface are always visible.
 * Trading requires login.
 */
const DTraderIntegrated: React.FC = () => {
    const { client } = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [symbol] = useState('R_100');

    useEffect(() => {
        // Initialize - no login required to view
        const initializeDTrader = async () => {
            try {
                console.log('DTrader: Initializing...');
                console.log('Active Account:', client?.loginid || 'Not logged in');
                console.log('API Connected:', api_base?.api ? 'Yes' : 'No');

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize DTrader:', error);
                setIsLoading(false);
            }
        };

        // Always initialize, regardless of login status
        initializeDTrader();
    }, [client?.loginid]);

    if (isLoading) {
        return (
            <div className='dtrader-integrated-loading'>
                <div className='loading-spinner'></div>
                <p>Loading DTrader...</p>
            </div>
        );
    }

    return (
        <div className='dtrader-integrated-container'>
            <div className='dtrader-header'>
                <div className='header-left'>
                    <h2>DTrader</h2>
                </div>
                <div className='account-info'>
                    {client?.loginid ? (
                        <>
                            <span className='account-id'>
                                <span className='label'>Account:</span>
                                <span className='value'>{client.loginid}</span>
                            </span>
                            <span className='balance'>
                                <span className='label'>Balance:</span>
                                <span className='value'>
                                    {client?.currency} {Number(client?.balance || 0).toFixed(2)}
                                </span>
                            </span>
                        </>
                    ) : (
                        <span className='login-prompt'>
                            <span className='label'>Login required to trade</span>
                        </span>
                    )}
                </div>
            </div>

            <div className='dtrader-content'>
                {/* Trading Chart Section - Always visible */}
                <div className='trading-chart-section'>
                    <Suspense fallback={<ChunkLoader message={localize('Loading chart...')} />}>
                        <Chart show_digits_stats={true} />
                    </Suspense>
                </div>

                {/* Trading Panel Section - Always visible */}
                <div className='trading-panel-section'>
                    <TradingPanel symbol={symbol} />
                </div>
            </div>
        </div>
    );
};

export default DTraderIntegrated;

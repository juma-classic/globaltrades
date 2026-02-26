import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './dtrader-iframe-external.scss';

/**
 * DTrader External with Secure Token Injection
 * Properly retrieves token from accountsList and injects it securely
 */
const DTraderIframeExternal: React.FC = observer(() => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeUrl, setIframeUrl] = useState('https://deriv-dtrader.vercel.app');
    const [isLoading, setIsLoading] = useState(true);
    const [authInjected, setAuthInjected] = useState(false);
    const { client } = useStore();

    useEffect(() => {
        // Get token from accountsList (correct storage location)
        const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
        const activeLoginid = localStorage.getItem('active_loginid');
        const authToken = activeLoginid ? accountsList[activeLoginid] : null;

        if (authToken && activeLoginid) {
            // Construct URL with authentication parameters for DTrader
            const url = new URL('https://deriv-dtrader.vercel.app');
            url.searchParams.set('token1', authToken);
            url.searchParams.set('acct1', activeLoginid);
            url.searchParams.set('app_id', '117918'); // GLOBALTRADES app ID
            setIframeUrl(url.toString());

            console.log('🔐 DTrader External: Token retrieved from accountsList');
            console.log('📋 Login ID:', activeLoginid);
            console.log('🔑 Token length:', authToken.length);
        } else {
            console.warn('⚠️ DTrader External: No authentication token found');
            console.log('Active Login ID:', activeLoginid);
            console.log('Accounts List:', Object.keys(accountsList));
        }
    }, []);

    useEffect(() => {
        // Listen for messages from DTrader iframe
        const handleMessage = (event: MessageEvent) => {
            // Security: Only accept messages from deriv-dtrader.vercel.app
            if (!event.origin.includes('deriv-dtrader.vercel.app')) return;

            const { type, data } = event.data;

            switch (type) {
                case 'DTRADER_READY':
                    console.log('✅ DTrader is ready');
                    setIsLoading(false);
                    // Send additional auth data if needed
                    sendAuthToDTrader();
                    break;

                case 'DTRADER_REQUEST_AUTH':
                    console.log('🔐 DTrader requesting authentication');
                    sendAuthToDTrader();
                    break;

                case 'DTRADER_AUTH_SUCCESS':
                    console.log('✅ DTrader authenticated successfully');
                    setAuthInjected(true);
                    setIsLoading(false);
                    break;

                case 'DTRADER_AUTH_FAILED':
                    console.error('❌ DTrader authentication failed:', data);
                    setIsLoading(false);
                    break;

                case 'TRADE_EXECUTED':
                    console.log('📊 Trade executed in DTrader:', data);
                    break;

                default:
                    console.log('📨 DTrader message:', type, data);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const sendAuthToDTrader = () => {
        if (!iframeRef.current?.contentWindow) return;

        // Get fresh token data
        const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
        const activeLoginid = localStorage.getItem('active_loginid');
        const authToken = activeLoginid ? accountsList[activeLoginid] : null;

        if (!authToken || !activeLoginid) {
            console.warn('⚠️ Cannot send auth: No token available');
            return;
        }

        const authData = {
            type: 'AUTH_DATA',
            data: {
                token: authToken,
                loginid: activeLoginid,
                currency: client?.currency || 'USD',
                balance: client?.balance || 0,
                email: client?.email || '',
                app_id: '117918', // GLOBALTRADES app ID
            },
        };

        console.log('🔑 Sending auth to DTrader via postMessage');
        console.log('📋 Account:', activeLoginid);

        try {
            iframeRef.current.contentWindow.postMessage(authData, 'https://deriv-dtrader.vercel.app');
        } catch (error) {
            console.error('❌ Failed to send auth to DTrader:', error);
        }
    };

    const handleIframeLoad = () => {
        console.log('📦 DTrader iframe loaded');
        setIsLoading(false);
        
        // Give DTrader a moment to initialize, then send auth
        setTimeout(() => {
            sendAuthToDTrader();
        }, 1000);
    };

    return (
        <div className='dtrader-iframe-external'>
            {isLoading && (
                <div className='dtrader-iframe-external__loading'>
                    <div className='loading-spinner'></div>
                    <p>Loading DTrader...</p>
                </div>
            )}
            
            {!authInjected && !isLoading && (
                <div className='dtrader-iframe-external__auth-notice'>
                    <p>⚠️ Waiting for DTrader authentication...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        If DTrader doesn't load, please ensure you're logged in to GLOBALTRADES
                    </p>
                </div>
            )}

            <div className='dtrader-iframe-external__container'>
                <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className='dtrader-iframe-external__iframe'
                    title='Deriv DTrader'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    onLoad={handleIframeLoad}
                />
            </div>
        </div>
    );
});

export default DTraderIframeExternal;

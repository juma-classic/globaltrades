import React, { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import './dtrader-iframe.scss';

/**
 * DTrader Iframe Component
 * 
 * IMPORTANT: This component passes the user's authentication token to the DTrader iframe.
 * For this to work, the DTrader application (deriv-dtrader.vercel.app) must be configured to:
 * 1. Accept 'token' and 'acct1' URL parameters
 * 2. Use these parameters to authenticate the user automatically
 * 3. Execute trades using the provided token
 * 
 * If the DTrader app doesn't support this, users will need to log in separately
 * within the iframe, and trades will execute through that separate session.
 */
const DTraderIframe: React.FC = () => {
    const { client } = useStore();
    const [iframeUrl, setIframeUrl] = useState('https://deriv-dtrader.vercel.app');

    useEffect(() => {
        // Get the active account token
        const activeLoginid = client?.loginid;
        const accounts = client?.accounts;
        
        if (activeLoginid && accounts?.[activeLoginid]) {
            const token = accounts[activeLoginid].token;
            
            // Pass token and account info to DTrader via URL parameters
            if (token) {
                const url = new URL('https://deriv-dtrader.vercel.app');
                url.searchParams.set('token', token);
                url.searchParams.set('acct1', activeLoginid);
                setIframeUrl(url.toString());
                
                console.log('🔐 DTrader: Passing authentication token to iframe');
            }
        } else {
            console.warn('⚠️ DTrader: No active account found. User will need to log in separately.');
        }
    }, [client?.loginid, client?.accounts]);

    return (
        <div className='dtrader-iframe-container'>
            <iframe
                src={iframeUrl}
                title='DTrader'
                className='dtrader-iframe'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
            />
        </div>
    );
};

export default DTraderIframe;

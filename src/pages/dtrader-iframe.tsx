import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './dtrader-iframe.scss';

const DTraderIframe = observer(() => {
    const [dtraderUrl, setDtraderUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { client } = useStore();

    useEffect(() => {
        try {
            // Get authentication data from client store
            const accountId = client?.loginid;
            const accountData = accountId ? client.accounts[accountId] : null;
            const token = accountData && 'token' in accountData ? accountData.token : null;
            const currency = client?.currency || 'USD';

            if (!token || !accountId) {
                setError('Please log in to access DTrader');
                setIsLoading(false);
                return;
            }

            // Build DTrader URL with authentication parameters
            const params = new URLSearchParams({
                acct1: accountId,
                token1: String(token),
                cur1: currency,
                lang: 'EN',
                app_id: '117918', // Your OAuth app ID
            });

            const url = `https://deriv-dtrader.vercel.app/dtrader?${params.toString()}`;
            setDtraderUrl(url);
            setIsLoading(false);

            // Clear token from URL after a short delay for security
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 1000);
        } catch (err) {
            console.error('Error loading DTrader:', err);
            setError('Failed to load DTrader');
            setIsLoading(false);
        }
    }, [client]);

    // Reload DTrader when account changes
    useEffect(() => {
        const handleAccountChange = () => {
            setIsLoading(true);
            // Trigger re-render by updating a dependency
            setTimeout(() => {
                window.location.reload();
            }, 100);
        };

        window.addEventListener('accountChanged', handleAccountChange);

        return () => {
            window.removeEventListener('accountChanged', handleAccountChange);
        };
    }, []);

    if (isLoading) {
        return (
            <div className='dtrader-loading'>
                <div className='dtrader-spinner'></div>
                <p>Loading DTrader...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='dtrader-error'>
                <h3>Failed to Load DTrader</h3>
                <p>{error}</p>
                <button onClick={() => (window.location.href = '/')} className='dtrader-error-button'>
                    Go to Home
                </button>
                <button
                    onClick={() => window.location.replace('https://oauth.deriv.com/oauth2/authorize?app_id=117918&l=EN&brand=globaltrades')}
                    className='dtrader-error-button dtrader-error-button--primary'
                >
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div className='dtrader-container'>
            <div className='dtrader-header'>
                <h2>DTrader</h2>
                <button onClick={() => window.location.reload()} className='dtrader-reload-btn'>
                    ↻ Reload
                </button>
            </div>

            <iframe
                src={dtraderUrl}
                title='Deriv DTrader'
                className='dtrader-iframe'
                allow='clipboard-write'
                sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox'
            />
        </div>
    );
});

export default DTraderIframe;

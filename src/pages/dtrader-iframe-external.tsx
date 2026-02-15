import React, { useEffect, useState } from 'react';
import './dtrader-iframe-external.scss';

const DTraderIframeExternal: React.FC = () => {
    const [iframeUrl, setIframeUrl] = useState('https://deriv-dtrader.vercel.app');

    useEffect(() => {
        // Try to pass authentication to the iframe if user is logged in
        const authToken = localStorage.getItem('authToken');
        const activeLoginid = localStorage.getItem('active_loginid');

        if (authToken && activeLoginid) {
            // Construct URL with authentication parameters
            const url = new URL('https://deriv-dtrader.vercel.app');
            url.searchParams.set('token1', authToken);
            url.searchParams.set('acct1', activeLoginid);
            setIframeUrl(url.toString());

            console.log('🔐 DTrader External: Passing authentication token');
        }
    }, []);

    return (
        <div className='dtrader-iframe-external'>
            <div className='dtrader-iframe-external__container'>
                <iframe
                    src={iframeUrl}
                    className='dtrader-iframe-external__iframe'
                    title='Deriv DTrader'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default DTraderIframeExternal;

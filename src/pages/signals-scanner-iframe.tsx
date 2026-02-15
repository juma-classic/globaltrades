import React from 'react';
import './signals-scanner-iframe.scss';

const SignalsScannerIframe: React.FC = () => {
    return (
        <div className='signals-scanner-iframe-container'>
            <iframe
                src='https://signal-scanner.vercel.app'
                title='Signals Scanner'
                className='signals-scanner-iframe'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
            />
        </div>
    );
};

export default SignalsScannerIframe;

import React from 'react';
import './copy-trading.scss';

const CopyTrading: React.FC = () => {
    return (
        <div className='copy-trading-container'>
            <iframe
                src='/ai/copy-trading.html'
                title='Copy Trading'
                className='copy-trading-iframe'
                sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
            />
        </div>
    );
};

export default CopyTrading;

import React, { useState } from 'react';
import { Localize } from '@deriv-com/translations';
import CopyTrading from './copy-trading';
import NewCopyTrading from './new-copy-trading';
import { NewCopytradingIcon, ClassicCopytradingIcon } from '../components/copytrading/CopytradingIcons';
import './copytrading-plus.scss';

const CopytradingPlus: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'classic' | 'new'>('new');

    return (
        <div className='copytrading-plus'>
            <div className='copytrading-plus__tabs'>
                <button
                    className={`copytrading-plus__tab ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    <NewCopytradingIcon />
                    <Localize i18n_default_text='New Copytrading' />
                    <span className='tab-badge'>NEW</span>
                </button>
                <button
                    className={`copytrading-plus__tab ${activeTab === 'classic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('classic')}
                >
                    <ClassicCopytradingIcon />
                    <Localize i18n_default_text='Classic Copytrading' />
                </button>
            </div>

            <div className='copytrading-plus__content'>
                {activeTab === 'new' ? <NewCopyTrading /> : <CopyTrading />}
            </div>
        </div>
    );
};

export default CopytradingPlus;

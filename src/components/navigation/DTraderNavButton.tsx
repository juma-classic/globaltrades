import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DTraderNavButton.scss';

interface DTraderNavButtonProps {
    variant?: 'desktop' | 'mobile';
}

export const DTraderNavButton: React.FC<DTraderNavButtonProps> = ({ variant = 'desktop' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/dtrader');
    };

    if (variant === 'mobile') {
        return (
            <button className='dtrader-nav-button dtrader-nav-button--mobile' onClick={handleClick}>
                <span className='dtrader-nav-button__icon'>📊</span>
                <span className='dtrader-nav-button__text'>DTrader</span>
            </button>
        );
    }

    return (
        <button className='dtrader-nav-button dtrader-nav-button--desktop' onClick={handleClick}>
            <span className='dtrader-nav-button__icon'>📊</span>
            <span className='dtrader-nav-button__text'>DTrader</span>
        </button>
    );
};

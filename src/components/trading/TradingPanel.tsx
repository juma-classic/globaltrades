import React, { useState, useEffect } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import './TradingPanel.scss';

interface ProposalResponse {
    proposal?: {
        id: string;
        ask_price: number;
        payout: number;
        spot: number;
        display_value: string;
    };
    error?: {
        message: string;
    };
}

interface ContractTypeConfig {
    name: string;
    types: {
        primary: string;
        secondary: string;
    };
    labels: {
        primary: string;
        secondary: string;
    };
    requiresBarrier: boolean;
}

export const TradingPanel: React.FC<{ symbol: string }> = ({ symbol }) => {
    const { client } = useStore();
    const [currentContractIndex, setCurrentContractIndex] = useState(0);
    const [stake, setStake] = useState(10);
    const [duration, setDuration] = useState(1);
    const [lastDigit, setLastDigit] = useState(3);
    const [viewMode, setViewMode] = useState<'stake' | 'payout'>('stake');
    const [primaryProposal, setPrimaryProposal] = useState<ProposalResponse | null>(null);
    const [secondaryProposal, setSecondaryProposal] = useState<ProposalResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isLoggedIn = Boolean(client?.loginid);

    const contractTypes: ContractTypeConfig[] = [
        {
            name: 'Over/Under',
            types: { primary: 'DIGITOVER', secondary: 'DIGITUNDER' },
            labels: { primary: 'Over', secondary: 'Under' },
            requiresBarrier: true,
        },
        {
            name: 'Rise/Fall',
            types: { primary: 'CALL', secondary: 'PUT' },
            labels: { primary: 'Rise', secondary: 'Fall' },
            requiresBarrier: false,
        },
        {
            name: 'Even/Odd',
            types: { primary: 'DIGITEVEN', secondary: 'DIGITODD' },
            labels: { primary: 'Even', secondary: 'Odd' },
            requiresBarrier: false,
        },
        {
            name: 'Matches/Differs',
            types: { primary: 'DIGITMATCH', secondary: 'DIGITDIFF' },
            labels: { primary: 'Matches', secondary: 'Differs' },
            requiresBarrier: true,
        },
    ];

    const currentContract = contractTypes[currentContractIndex];

    // Navigate between contract types
    const navigateContract = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentContractIndex(prev => (prev === 0 ? contractTypes.length - 1 : prev - 1));
        } else {
            setCurrentContractIndex(prev => (prev === contractTypes.length - 1 ? 0 : prev + 1));
        }
    };

    // Get proposals for both contract types
    useEffect(() => {
        if (!isLoggedIn || !api_base.api) {
            setPrimaryProposal(null);
            setSecondaryProposal(null);
            return;
        }

        const getProposals = async () => {
            try {
                const baseParams = {
                    proposal: 1,
                    amount: stake,
                    basis: 'stake',
                    currency: client.currency || 'USD',
                    duration: duration,
                    duration_unit: 't',
                    symbol: symbol,
                };

                // Primary proposal
                const primaryParams = {
                    ...baseParams,
                    contract_type: currentContract.types.primary,
                    ...(currentContract.requiresBarrier && { barrier: lastDigit.toString() }),
                };
                const primaryResponse = await api_base.api.proposal(primaryParams);
                setPrimaryProposal(primaryResponse as ProposalResponse);

                // Secondary proposal
                const secondaryParams = {
                    ...baseParams,
                    contract_type: currentContract.types.secondary,
                    ...(currentContract.requiresBarrier && { barrier: lastDigit.toString() }),
                };
                const secondaryResponse = await api_base.api.proposal(secondaryParams);
                setSecondaryProposal(secondaryResponse as ProposalResponse);

                setError(null);
            } catch (err: any) {
                console.error('Proposal error:', err);
                setError(err.message || 'Failed to get proposal');
            }
        };

        const debounce = setTimeout(getProposals, 500);
        return () => clearTimeout(debounce);
    }, [stake, duration, lastDigit, symbol, client?.loginid, client?.currency, isLoggedIn, currentContractIndex]);

    const handleTrade = async (type: 'primary' | 'secondary') => {
        const proposal = type === 'primary' ? primaryProposal : secondaryProposal;

        if (!api_base.api || !proposal?.proposal) {
            setError('No proposal available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const buyResponse = await api_base.api.buy({
                buy: proposal.proposal.id,
                price: stake,
            });

            if (buyResponse.buy) {
                console.log('Trade executed:', buyResponse);
            } else if (buyResponse.error) {
                setError(buyResponse.error.message);
            }
        } catch (err: any) {
            console.error('Trade error:', err);
            setError(err.message || 'Failed to execute trade');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateProfitPercentage = (payout: number, stake: number) => {
        return (((payout - stake) / stake) * 100).toFixed(2);
    };

    return (
        <div className='trading-panel-deriv'>
            {/* Trade Type Selector */}
            <div className='trade-type-section'>
                <div className='section-label'>Learn about this trade type</div>
                <div className='trade-type-selector'>
                    <button className='nav-btn' onClick={() => navigateContract('prev')}>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                        >
                            <polyline points='15 18 9 12 15 6'></polyline>
                        </svg>
                    </button>
                    <div className='trade-type-display'>
                        <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                        >
                            <polyline points='18 15 12 9 6 15'></polyline>
                            <polyline points='6 9 12 15 18 9'></polyline>
                        </svg>
                        <span>{currentContract.name}</span>
                    </div>
                    <button className='nav-btn' onClick={() => navigateContract('next')}>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                        >
                            <polyline points='9 18 15 12 9 6'></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Duration */}
            <div className='duration-section'>
                <div className='duration-label'>Ticks</div>
                <div className='duration-value'>{duration} Tick</div>
            </div>

            {/* Last Digit Prediction - Only show for contracts that require barrier */}
            {currentContract.requiresBarrier && (
                <div className='digit-prediction-section'>
                    <div className='section-title'>Last Digit Prediction</div>
                    <div className='digit-grid'>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                            <button
                                key={digit}
                                className={`digit-btn ${lastDigit === digit ? 'active' : ''}`}
                                onClick={() => setLastDigit(digit)}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stake/Payout Toggle */}
            <div className='stake-payout-toggle'>
                <button
                    className={`toggle-btn ${viewMode === 'stake' ? 'active' : ''}`}
                    onClick={() => setViewMode('stake')}
                >
                    Stake
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'payout' ? 'active' : ''}`}
                    onClick={() => setViewMode('payout')}
                >
                    Payout
                </button>
            </div>

            {/* Stake Amount */}
            <div className='stake-input-section'>
                <button className='adjust-btn' onClick={() => setStake(Math.max(1, stake - 1))}>
                    −
                </button>
                <input
                    type='number'
                    value={stake}
                    onChange={e => setStake(Math.max(1, Number(e.target.value)))}
                    className='stake-input'
                />
                <span className='currency-label'>{client?.currency || 'USD'}</span>
                <button className='adjust-btn' onClick={() => setStake(stake + 1)}>
                    +
                </button>
            </div>

            {/* Payout Display */}
            {primaryProposal?.proposal && (
                <div className='payout-display'>
                    Payout {primaryProposal.proposal.payout.toFixed(2)} {client?.currency || 'USD'}
                </div>
            )}

            {/* Error Message */}
            {error && <div className='error-message'>{error}</div>}

            {/* Trade Buttons */}
            <div className='trade-buttons'>
                {!isLoggedIn && <div className='login-required-message-inline'>Please log in to start trading</div>}
                <button
                    className='trade-btn primary-btn'
                    onClick={() => handleTrade('primary')}
                    disabled={isLoading || !primaryProposal?.proposal || !isLoggedIn}
                >
                    <div className='btn-content'>
                        <div className='btn-label'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2.5'
                            >
                                <polyline points='18 15 12 9 6 15'></polyline>
                            </svg>
                            <span>{currentContract.labels.primary}</span>
                        </div>
                        {primaryProposal?.proposal && (
                            <div className='btn-percentage'>
                                {calculateProfitPercentage(primaryProposal.proposal.payout, stake)}%
                            </div>
                        )}
                    </div>
                    {primaryProposal?.proposal && (
                        <div className='btn-payout'>
                            Payout {primaryProposal.proposal.payout.toFixed(2)} {client?.currency || 'USD'}
                        </div>
                    )}
                </button>

                <button
                    className='trade-btn secondary-btn'
                    onClick={() => handleTrade('secondary')}
                    disabled={isLoading || !secondaryProposal?.proposal || !isLoggedIn}
                >
                    <div className='btn-content'>
                        <div className='btn-label'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2.5'
                            >
                                <polyline points='6 9 12 15 18 9'></polyline>
                            </svg>
                            <span>{currentContract.labels.secondary}</span>
                        </div>
                        {secondaryProposal?.proposal && (
                            <div className='btn-percentage'>
                                {calculateProfitPercentage(secondaryProposal.proposal.payout, stake)}%
                            </div>
                        )}
                    </div>
                    {secondaryProposal?.proposal && (
                        <div className='btn-payout'>
                            Payout {secondaryProposal.proposal.payout.toFixed(2)} {client?.currency || 'USD'}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

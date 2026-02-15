import React, { useState, useEffect } from 'react';
import './new-copy-trading.scss';

interface FollowerToken {
    id: string;
    token: string;
}

interface MasterAccountInfo {
    loginid: string;
    token: string;
    currency: string;
    balance: string;
}

const NewCopyTrading: React.FC = () => {
    const [masterToken, setMasterToken] = useState('');
    const [masterAccount, setMasterAccount] = useState<MasterAccountInfo | null>(null);
    const [followerTokens, setFollowerTokens] = useState<FollowerToken[]>([]);
    const [newToken, setNewToken] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    // Advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minStake, setMinStake] = useState<number | ''>('');
    const [maxStake, setMaxStake] = useState<number | ''>('');

    // Auto-fill master token from localStorage if user is logged in
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            setMasterToken(authToken);
        }
    }, []);

    const loadAccountBalance = (token: string) => {
        setIsLoading(true);
        const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=1089`);

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    authorize: token,
                })
            );
        };

        ws.onmessage = msg => {
            const data = JSON.parse(msg.data);

            if (data.error) {
                showMessage(`Error: ${data.error.message}`, 'error');
                setIsLoading(false);
                ws.close();
                return;
            }

            if (data.msg_type === 'authorize' && !data.error) {
                setMasterAccount({
                    loginid: data.authorize.loginid,
                    token: token,
                    currency: data.authorize.currency,
                    balance: data.authorize.balance,
                });
                setMasterToken(token);
                showMessage('Master account connected successfully', 'success');
                setIsLoading(false);
                ws.close();
            }
        };

        ws.onerror = () => {
            showMessage('Failed to connect master account', 'error');
            setIsLoading(false);
        };
    };

    const handleSetMasterAccount = () => {
        if (!masterToken.trim()) {
            showMessage('Please enter master account token', 'error');
            return;
        }

        if (masterToken.length < 10) {
            showMessage('Invalid token format', 'error');
            return;
        }

        loadAccountBalance(masterToken);
    };

    const addFollowerToken = () => {
        if (!newToken.trim()) {
            showMessage('Please enter a token', 'error');
            return;
        }

        if (newToken.length < 10) {
            showMessage('Invalid token format', 'error');
            return;
        }

        const id = Date.now().toString();
        setFollowerTokens([...followerTokens, { id, token: newToken.trim() }]);
        setNewToken('');
        showMessage('Token added successfully', 'success');
    };

    const removeFollowerToken = (id: string) => {
        setFollowerTokens(followerTokens.filter(t => t.id !== id));
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const startCopyTrading = async () => {
        if (!masterAccount) {
            showMessage('Please set master account first', 'error');
            return;
        }

        if (followerTokens.length === 0) {
            showMessage('Please add at least one follower token', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Connect to each follower account and start copy trading
            const results = await Promise.all(
                followerTokens.map(async ({ token }) => {
                    try {
                        const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=1089`);

                        return new Promise((resolve, reject) => {
                            ws.onopen = () => {
                                // Authorize first
                                ws.send(
                                    JSON.stringify({
                                        authorize: token,
                                    })
                                );
                            };

                            ws.onmessage = msg => {
                                const data = JSON.parse(msg.data);

                                if (data.error) {
                                    reject(data.error.message);
                                    ws.close();
                                    return;
                                }

                                if (data.msg_type === 'authorize') {
                                    // Now send copy_start request with master token
                                    const request: any = {
                                        copy_start: masterAccount.token,
                                    };

                                    // Add optional stake limits if configured
                                    if (minStake !== '') {
                                        request.min_trade_stake = minStake;
                                    }

                                    if (maxStake !== '') {
                                        request.max_trade_stake = maxStake;
                                    }

                                    ws.send(JSON.stringify(request));
                                }

                                if (data.msg_type === 'copy_start') {
                                    if (data.copy_start === 1) {
                                        resolve({ success: true, loginid: data.echo_req?.loginid });
                                    } else {
                                        reject('Failed to start copy trading');
                                    }
                                    ws.close();
                                }
                            };

                            ws.onerror = () => {
                                reject('Connection failed');
                            };

                            setTimeout(() => {
                                reject('Connection timeout');
                                ws.close();
                            }, 10000);
                        });
                    } catch (error: any) {
                        return { success: false, error: error.message };
                    }
                })
            );

            const successCount = results.filter((r: any) => r.success).length;
            const failCount = results.filter((r: any) => !r.success).length;

            if (successCount > 0) {
                setIsActive(true);
                showMessage(
                    `✅ Copy trading started! ${successCount} follower(s) connected${failCount > 0 ? `, ${failCount} failed` : ''}`,
                    'success'
                );
            } else {
                showMessage('❌ Failed to start copy trading for all followers', 'error');
            }
        } catch (error: any) {
            showMessage(`❌ Error: ${error?.message || error || 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const stopCopyTrading = () => {
        setIsActive(false);
        showMessage('Copy trading stopped', 'success');
    };

    return (
        <div className='new-copy-trading'>
            <div className='new-copy-trading__container'>
                <div className='new-copy-trading__header'>
                    <h1>New Copy Trading</h1>
                    <p>Advanced copy trading with official Deriv API</p>
                </div>

                {message && <div className={`alert alert-${messageType}`}>{message}</div>}

                <div className='new-copy-trading__section'>
                    <h2>Master Account (Your Account)</h2>
                    <p className='section-description'>Enter the API token for the account that will be copied</p>

                    {!masterAccount ? (
                        <div className='token-input-group'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter master account API token'
                                value={masterToken}
                                onChange={e => setMasterToken(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSetMasterAccount()}
                                disabled={isLoading}
                            />
                            <button className='btn btn-secondary' onClick={handleSetMasterAccount} disabled={isLoading}>
                                {isLoading ? 'Connecting...' : 'Set Master'}
                            </button>
                        </div>
                    ) : (
                        <div className='master-account-card'>
                            <div className='account-info'>
                                <div className='account-id'>{masterAccount.loginid}</div>
                                <div className='account-type'>
                                    {masterAccount.loginid.startsWith('VR') ? '🎮 Demo Account' : '💰 Real Account'}
                                </div>
                                <div className='account-balance'>
                                    {masterAccount.balance} {masterAccount.currency}
                                </div>
                            </div>
                            <div className='account-badge'>MASTER</div>
                        </div>
                    )}
                </div>

                <div className='new-copy-trading__section'>
                    <h2>Follower Accounts (Client Tokens)</h2>
                    <p className='section-description'>
                        Add your clients' API tokens to copy your trades to their accounts
                    </p>
                    <div className='token-input-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Enter client API token'
                            value={newToken}
                            onChange={e => setNewToken(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addFollowerToken()}
                            disabled={isActive || !masterAccount}
                        />
                        <button
                            className='btn btn-secondary'
                            onClick={addFollowerToken}
                            disabled={isActive || !masterAccount}
                        >
                            Add Token
                        </button>
                    </div>

                    {followerTokens.length > 0 && (
                        <div className='token-list'>
                            <div className='list-header'>Total Clients added: {followerTokens.length}</div>
                            {followerTokens.map(({ id, token }, index) => (
                                <div key={id} className='token-item'>
                                    <span className='token-number'>{index + 1}.</span>
                                    <span className='token-text'>{token}</span>
                                    <button
                                        className='btn-remove'
                                        onClick={() => removeFollowerToken(id)}
                                        disabled={isActive}
                                        title='Remove token'
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='new-copy-trading__section'>
                    <button className='advanced-toggle' onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? '▼' : '▶'} Advanced Settings
                    </button>

                    {showAdvanced && (
                        <div className='advanced-settings'>
                            <div className='setting-group'>
                                <h3>Stake Limits</h3>
                                <p className='setting-description'>
                                    Set minimum and maximum stake amounts for copied trades
                                </p>
                                <div className='stake-inputs'>
                                    <div className='input-group'>
                                        <label>Min Stake</label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            placeholder='e.g., 1'
                                            value={minStake}
                                            onChange={e => setMinStake(e.target.value ? Number(e.target.value) : '')}
                                            disabled={isActive}
                                        />
                                    </div>
                                    <div className='input-group'>
                                        <label>Max Stake</label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            placeholder='e.g., 100'
                                            value={maxStake}
                                            onChange={e => setMaxStake(e.target.value ? Number(e.target.value) : '')}
                                            disabled={isActive}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className='new-copy-trading__actions'>
                    {!isActive ? (
                        <button className='btn btn-primary btn-large' onClick={startCopyTrading} disabled={isLoading}>
                            {isLoading ? 'Starting...' : 'Start Copy Trading'}
                        </button>
                    ) : (
                        <button className='btn btn-danger btn-large' onClick={stopCopyTrading}>
                            Stop Copy Trading
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewCopyTrading;

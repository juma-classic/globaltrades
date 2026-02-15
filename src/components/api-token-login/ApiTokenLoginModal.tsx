import React, { useState } from 'react';
import './ApiTokenLoginModal.scss';

interface ApiTokenLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiTokenLoginModal: React.FC<ApiTokenLoginModalProps> = ({ isOpen, onClose }) => {
    const [apiToken, setApiToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleLogin = async () => {
        if (!apiToken.trim()) {
            setError('Please enter your API token');
            return;
        }

        if (apiToken.length < 10) {
            setError('Invalid API token format');
            return;
        }

        setIsLoading(true);
        setError('');

        console.log('🔐 Starting API token login...');

        try {
            const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=1089`);

            const timeout = setTimeout(() => {
                console.error('❌ Connection timeout');
                setError('Connection timeout. Please try again.');
                setIsLoading(false);
                ws.close();
            }, 10000);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                ws.send(
                    JSON.stringify({
                        authorize: apiToken,
                        req_id: 1,
                    })
                );
            };

            ws.onmessage = msg => {
                clearTimeout(timeout);
                const data = JSON.parse(msg.data);
                console.log('📨 Response:', data);

                if (data.error) {
                    console.error('❌ Error:', data.error);
                    setError(data.error.message || 'Authorization failed');
                    setIsLoading(false);
                    ws.close();
                    return;
                }

                if (data.msg_type === 'authorize') {
                    console.log('✅ Authorization successful!');
                    const accountData = data.authorize;

                    // Store account data
                    localStorage.setItem('authToken', apiToken);
                    localStorage.setItem('active_loginid', accountData.loginid);

                    const accountsList: Record<string, string> = {};
                    accountsList[accountData.loginid] = apiToken;
                    localStorage.setItem('accountsList', JSON.stringify(accountsList));

                    const clientAccounts: Record<string, any> = {};
                    clientAccounts[accountData.loginid] = {
                        loginid: accountData.loginid,
                        token: apiToken,
                        currency: accountData.currency,
                        balance: accountData.balance,
                    };
                    localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

                    // Dispatch custom event to notify other components
                    window.dispatchEvent(new Event('deriv-login'));

                    console.log('✅ Stored, redirecting...');
                    ws.close();

                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                }
            };

            ws.onerror = () => {
                clearTimeout(timeout);
                console.error('❌ WebSocket error');
                setError('Connection failed. Please check your internet.');
                setIsLoading(false);
            };

            ws.onclose = event => {
                clearTimeout(timeout);
                if (!event.wasClean) {
                    console.error('❌ Connection closed unexpectedly');
                }
            };
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className='api-token-modal-overlay' onClick={onClose}>
            <div className='api-token-modal' onClick={e => e.stopPropagation()}>
                <button className='api-token-modal__close' onClick={onClose} aria-label='Close'>
                    ×
                </button>

                <div className='api-token-modal__header'>
                    <h2>Login with API Token</h2>
                    <p>Enter your Deriv API token to access your account</p>
                </div>

                <div className='api-token-modal__body'>
                    <div className='form-group'>
                        <label htmlFor='api-token'>API Token</label>
                        <input
                            id='api-token'
                            type='text'
                            className='form-control'
                            placeholder='Enter your Deriv API token'
                            value={apiToken}
                            onChange={e => setApiToken(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            disabled={isLoading}
                            autoFocus
                        />
                        <small className='form-help'>
                            Get your API token from{' '}
                            <a href='https://app.deriv.com/account/api-token' target='_blank' rel='noopener noreferrer'>
                                Deriv API Settings
                            </a>
                        </small>
                    </div>

                    {error && <div className='alert alert-error'>{error}</div>}

                    <button className='btn btn-primary btn-block' onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>

                <div className='api-token-modal__footer'>
                    <p className='info-text'>
                        <strong>Note:</strong> Your API token must have the required scopes (read, trade) to use all
                        features.
                    </p>
                </div>
            </div>
        </div>
    );
};

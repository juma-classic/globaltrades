import React, { useState, useEffect } from 'react';
import './api-token-login.scss';

const ApiTokenLogin: React.FC = () => {
    const [apiToken, setApiToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show modal after component mounts
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Navigate back after animation
        setTimeout(() => {
            window.history.back();
        }, 300);
    };

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
            // Connect to Deriv API
            const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=1089`);
            
            // Set timeout for connection
            const timeout = setTimeout(() => {
                console.error('❌ Connection timeout');
                setError('Connection timeout. Please try again.');
                setIsLoading(false);
                ws.close();
            }, 10000);

            ws.onopen = () => {
                console.log('✅ WebSocket connected, sending authorize request...');
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
                console.log('📨 Received response:', data);

                if (data.error) {
                    console.error('❌ Authorization error:', data.error);
                    setError(data.error.message || 'Authorization failed');
                    setIsLoading(false);
                    ws.close();
                    return;
                }

                if (data.msg_type === 'authorize') {
                    console.log('✅ Authorization successful!');
                    const accountData = data.authorize;

                    console.log('💾 Storing account data:', {
                        loginid: accountData.loginid,
                        currency: accountData.currency,
                        balance: accountData.balance,
                    });

                    // Store token
                    localStorage.setItem('authToken', apiToken);
                    localStorage.setItem('active_loginid', accountData.loginid);

                    // Store account info in accountsList format
                    const accountsList: Record<string, string> = {};
                    accountsList[accountData.loginid] = apiToken;
                    localStorage.setItem('accountsList', JSON.stringify(accountsList));

                    // Store account info in clientAccounts format
                    const clientAccounts: Record<string, any> = {};
                    clientAccounts[accountData.loginid] = {
                        loginid: accountData.loginid,
                        token: apiToken,
                        currency: accountData.currency,
                        balance: accountData.balance,
                    };
                    localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

                    console.log('✅ Account data stored successfully');
                    ws.close();

                    // Show success message briefly before reload
                    setError('');
                    console.log('🔄 Reloading page...');

                    // Reload the site
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                }
            };

            ws.onerror = error => {
                clearTimeout(timeout);
                console.error('❌ WebSocket error:', error);
                setError('Connection failed. Please check your internet connection.');
                setIsLoading(false);
            };

            ws.onclose = event => {
                clearTimeout(timeout);
                if (!event.wasClean) {
                    console.error('❌ WebSocket closed unexpectedly:', event);
                }
            };
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className={`api-token-login ${isVisible ? 'visible' : ''}`}>
            <div className="api-token-login__overlay" onClick={handleClose}></div>
            <div className="api-token-login__container">
                <button className="api-token-login__close" onClick={handleClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="api-token-login__header">
                    <h1>API Token Login</h1>
                    <p>Enter your Deriv API token to login</p>
                </div>

                <div className="api-token-login__form">
                    <div className="form-group">
                        <label htmlFor="api-token">API Token</label>
                        <input
                            id="api-token"
                            type="text"
                            className="form-control"
                            placeholder="Enter your Deriv API token"
                            value={apiToken}
                            onChange={(e) => setApiToken(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            disabled={isLoading}
                            autoFocus
                        />
                        <small className="form-text">
                            Get your API token from{' '}
                            <a
                                href="https://app.deriv.com/account/api-token"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Deriv API Token Settings
                            </a>
                        </small>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiTokenLogin;

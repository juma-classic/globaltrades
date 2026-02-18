# DTrader Debugging Checklist

## Current Status Check

### ✅ What's Working
1. Token injection script is loaded
2. Files are loading (no more 404 errors)
3. DTrader application is running
4. Token is being passed to iframe

### ⚠️ What Needs Checking
1. API connection errors ("WrongResponse")
2. Authentication status
3. App ID configuration

---

## Step-by-Step Debugging

### Step 1: Check if You're Logged In
**Open Browser Console on Main Page (not iframe)**

```javascript
// Check if you have authentication
console.log('Auth Token:', localStorage.getItem('authToken'));
console.log('Login ID:', localStorage.getItem('active_loginid'));
```

**Expected Result:**
- Should show your token (starts with `a1-`)
- Should show your login ID (like `VRTC7528369`)

**If NULL:** You need to log in to GLOBALTRADES first!

---

### Step 2: Check DTrader Iframe Storage
**Open Browser Console → Switch to iframe context**

1. In DevTools Console, click the dropdown that says "top"
2. Select the iframe (should show the dtrader.html URL)
3. Run these commands:

```javascript
// Check localStorage in iframe
console.log('=== IFRAME STORAGE ===');
console.log('App ID:', localStorage.getItem('config.app_id'));
console.log('Server URL:', localStorage.getItem('config.server_url'));
console.log('Active Login:', localStorage.getItem('active_loginid'));
console.log('Accounts List:', localStorage.getItem('accountsList'));
console.log('Client Accounts:', localStorage.getItem('client.accounts'));
```

**Expected Result:**
```
App ID: "117918"
Server URL: "green.derivws.com"
Active Login: "VRTC7528369"
Accounts List: [{"token":"a1-...","loginid":"VRTC7528369"}]
Client Accounts: {"VRTC7528369":{...}}
```

---

### Step 3: Check WebSocket Connection
**In iframe console:**

```javascript
// Check if WebSocket is connected
console.log('WebSocket State:', window.DerivAPI?.connection?.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```

**Expected:** Should be `1` (OPEN)

---

### Step 4: Manual API Test
**In iframe console, test the API directly:**

```javascript
// Test API connection
const ws = new WebSocket('wss://green.derivws.com/websockets/v3?app_id=117918');

ws.onopen = () => {
    console.log('✅ WebSocket Connected!');
    // Test website_status call
    ws.send(JSON.stringify({
        website_status: 1,
        req_id: 999
    }));
};

ws.onmessage = (msg) => {
    console.log('📨 Response:', JSON.parse(msg.data));
};

ws.onerror = (error) => {
    console.error('❌ WebSocket Error:', error);
};
```

**Expected:** Should connect and return website status

---

### Step 5: Check Console Logs
**Look for these specific messages:**

✅ **Good Signs:**
```
🔧 GLOBALTRADES: Token injection script loaded
✅ GLOBALTRADES: App ID set to 117918
✅ GLOBALTRADES: Authentication injected for account VRTC7528369
📡 GLOBALTRADES: Notified parent that DTrader is ready
✅ DTrader: Authentication successful
✅ DTrader: Ready
```

❌ **Bad Signs:**
```
⚠️ GLOBALTRADES: No authentication found
❌ WrongResponse errors
❌ Syntax errors
❌ 404 errors
```

---

## Common Issues & Solutions

### Issue 1: "No authentication found"
**Cause:** Not logged in to GLOBALTRADES
**Solution:** 
1. Go to main GLOBALTRADES page
2. Log in with your credentials
3. Then navigate to DTrader

### Issue 2: "WrongResponse" API errors
**Cause:** App ID not properly configured or invalid
**Solution:**
1. Clear iframe localStorage
2. Refresh page
3. Check that app_id is 117918

**To clear iframe storage:**
```javascript
// In iframe console
localStorage.clear();
location.reload();
```

### Issue 3: Files not loading (404 errors)
**Cause:** File paths incorrect
**Solution:** Already fixed! Files should load now.

### Issue 4: Token not being injected
**Cause:** postMessage not working or timing issue
**Solution:**
1. Check browser console for postMessage logs
2. Verify same origin (both on localhost)
3. Try manual reload after login

---

## Manual Token Injection (Emergency)

If automatic injection fails, you can manually inject:

**Step 1: Get your token from main page**
```javascript
// On main GLOBALTRADES page
const token = localStorage.getItem('authToken');
const loginid = localStorage.getItem('active_loginid');
console.log('Token:', token);
console.log('Login ID:', loginid);
```

**Step 2: Inject into iframe**
```javascript
// Switch to iframe console
localStorage.setItem('config.app_id', '117918');
localStorage.setItem('config.server_url', 'green.derivws.com');
localStorage.setItem('active_loginid', 'YOUR_LOGIN_ID');
localStorage.setItem('accountsList', JSON.stringify([{
    token: 'YOUR_TOKEN',
    loginid: 'YOUR_LOGIN_ID'
}]));
localStorage.setItem('client.accounts', JSON.stringify({
    'YOUR_LOGIN_ID': {
        token: 'YOUR_TOKEN',
        email: '',
        session_start: Math.floor(Date.now() / 1000),
        excluded_until: '',
        landing_company_name: 'svg',
        residence: '',
        balance: 0,
        accepted_bch: 0
    }
}));

// Reload
location.reload();
```

---

## Expected Working Flow

1. **User logs in to GLOBALTRADES**
   - Token stored in main page localStorage

2. **User navigates to DTrader page**
   - Component loads iframe with URL parameters
   - Token passed via URL: `?token1=...&acct1=...&app_id=117918`

3. **Iframe loads**
   - Token injection script executes
   - Reads URL parameters
   - Stores in localStorage
   - Sends DTRADER_READY message

4. **Parent receives DTRADER_READY**
   - Sends AUTH_TOKEN via postMessage (backup)
   - Receives DTRADER_AUTH_SUCCESS

5. **DTrader connects to API**
   - Uses app_id 117918
   - Connects to green.derivws.com
   - Authenticates with token
   - Loads trading interface

6. **User can trade!** ✅

---

## Quick Test Commands

**Run these in order to verify everything:**

```javascript
// 1. Check main page auth
console.log('Main Auth:', !!localStorage.getItem('authToken'));

// 2. Switch to iframe console and check
console.log('Iframe App ID:', localStorage.getItem('config.app_id'));
console.log('Iframe Auth:', !!localStorage.getItem('active_loginid'));

// 3. Test WebSocket
const ws = new WebSocket('wss://green.derivws.com/websockets/v3?app_id=117918');
ws.onopen = () => console.log('✅ WebSocket OK');
ws.onerror = () => console.log('❌ WebSocket Failed');
```

---

## What Should Be Working Now

After the fixes:
- ✅ Token injection script in dtrader.html
- ✅ Relative file paths (./js/, ./css/)
- ✅ Correct filenames (without tilde ~)
- ✅ App ID configuration (117918)
- ✅ Server URL configuration (green.derivws.com)
- ✅ postMessage communication
- ✅ URL parameter passing

**Next Steps:**
1. Make sure you're logged in to GLOBALTRADES
2. Navigate to DTrader page
3. Check console for success messages
4. If still errors, run the debugging commands above

---

## Contact Points

If DTrader still doesn't work after all checks:
1. Share the complete console output (both main page and iframe)
2. Share localStorage contents (both contexts)
3. Share any error messages
4. Confirm you're logged in with a valid account

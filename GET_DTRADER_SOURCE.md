# How to Get Official DTrader Source Code

## Method 1: Clone from GitHub (Recommended)

The official Deriv app is open source on GitHub.

### Steps:

1. **Open a terminal in a separate directory** (not your project):
```bash
cd C:\Users\1elvi\OneDrive\Desktop\TRADING
mkdir deriv-source
cd deriv-source
```

2. **Clone the repository**:
```bash
git clone https://github.com/deriv-com/deriv-app.git
cd deriv-app
```

3. **Navigate to DTrader**:
```bash
cd packages/trader
```

4. **Install dependencies**:
```bash
npm install
```

5. **Verify it works**:
```bash
npm run build
```

## Method 2: Download ZIP

1. Go to: https://github.com/deriv-com/deriv-app
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Navigate to `deriv-app-main/packages/trader`

## What You'll Get

The `packages/trader` folder contains:
- `src/` - Source code for DTrader
- `build/` - Build configuration
- `package.json` - Dependencies
- All the components, styles, and logic

## What to Do Next

Once you have the source code, let me know and I'll:

1. **Modify the configuration** to use your app_id (68794)
2. **Update authentication** to use your app's login
3. **Build it** for your domain
4. **Integrate it** into your project
5. **Test** on desktop and mobile

## Important Files to Look For

In `packages/trader/src/`:
- `App/` - Main app component
- `Modules/Trading/` - Trading interface
- `Stores/` - State management
- `Services/` - API services
- `Constants/` - Configuration (where we'll set app_id)

## Repository Structure

```
deriv-app/
├── packages/
│   ├── trader/          ← This is what we need
│   ├── bot/
│   ├── cashier/
│   └── ...
```

## Once You Have It

Tell me:
1. ✅ "I have the source code"
2. 📍 Where you put it (path)
3. 🚀 Ready for me to help integrate it

Then I'll guide you through:
- Configuring your app_id
- Setting up authentication
- Building for production
- Integrating into your app
- Testing everything works

## Need Help?

If you run into any issues:
- Git not installed? Download from: https://git-scm.com/
- Node.js issues? Make sure you have Node 18+ installed
- Permission errors? Run terminal as administrator

---

**Ready?** Let me know when you have the source code and we'll integrate it!

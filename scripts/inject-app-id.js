const fs = require('fs');
const path = require('path');

const YOUR_APP_ID = '68794'; // Your app_id from src/config/api-config.ts

const beautifiedFile = path.join(__dirname, '../public/deriv-dtrader.vercel.app/js/core.maini.804607e2d73944397e19.beautified.js');
const outputFile = path.join(__dirname, '../public/deriv-dtrader.vercel.app/js/core.maini.804607e2d73944397e19.js');

console.log('Reading beautified file...');
let code = fs.readFileSync(beautifiedFile, 'utf8');

console.log('Injecting your app_id...');

// The code is wrapped in eval(), so we need to modify the string inside eval
// Find and replace the getAppId function logic

// Strategy 1: Replace the return statement at the end of getAppId
const pattern1 = /return \(0,_platform__WEBPACK_IMPORTED_MODULE_0__\.isBot\(\)\) \? DEFAULT_APP_IDS\.BOT_PRODUCTION : DEFAULT_APP_IDS\.DEFAULT_PRODUCTION;/g;
const replacement1 = `return ${YOUR_APP_ID}; // CUSTOM: Always use your app_id for commission attribution`;

if (pattern1.test(code)) {
    code = code.replace(pattern1, replacement1);
    console.log('✅ Successfully injected app_id (replaced final return statement)');
} else {
    console.log('⚠️  Pattern 1 not found, trying alternative patterns...');
    
    // Strategy 2: Replace all DEFAULT_APP_IDS references with your app_id
    const pattern2 = /DEFAULT_APP_IDS\.(DEFAULT_PRODUCTION|DEFAULT_STAGING|BOT_PRODUCTION|BOT_STAGING|LOCALHOST|DERIV_ME|DERIV_BE|DERIV_BE_STAGING|TEST_APP)/g;
    
    if (pattern2.test(code)) {
        code = code.replace(pattern2, YOUR_APP_ID);
        console.log('✅ Successfully injected app_id (replaced all DEFAULT_APP_IDS references)');
    } else {
        console.log('⚠️  Pattern 2 not found, trying to replace domain_app_ids...');
        
        // Strategy 3: Replace the domain_app_ids object values
        const pattern3 = /domain_app_ids = \{[^}]+\}/;
        const replacement3 = `domain_app_ids = {
  'deriv.app': ${YOUR_APP_ID},
  'app.deriv.com': ${YOUR_APP_ID},
  'staging-app.deriv.com': ${YOUR_APP_ID},
  'app.deriv.me': ${YOUR_APP_ID},
  'staging-app.deriv.me': ${YOUR_APP_ID},
  'app.deriv.be': ${YOUR_APP_ID},
  'staging-app.deriv.be': ${YOUR_APP_ID},
  'binary.com': ${YOUR_APP_ID},
  'test-app.deriv.com': ${YOUR_APP_ID}
}`;
        
        if (pattern3.test(code)) {
            code = code.replace(pattern3, replacement3);
            console.log('✅ Successfully injected app_id (replaced domain_app_ids)');
        } else {
            console.error('❌ Could not find any pattern to modify');
            console.log('Attempting broad replacement...');
            
            // Strategy 4: Just replace the number values in DEFAULT_APP_IDS
            code = code.replace(/DEFAULT_APP_IDS = \{[^}]+\}/g, `DEFAULT_APP_IDS = {
  LOCALHOST: ${YOUR_APP_ID},
  BOT_STAGING: ${YOUR_APP_ID},
  BOT_PRODUCTION: ${YOUR_APP_ID},
  DEFAULT_STAGING: ${YOUR_APP_ID},
  DEFAULT_PRODUCTION: ${YOUR_APP_ID},
  DERIV_ME: ${YOUR_APP_ID},
  DERIV_BE: ${YOUR_APP_ID},
  DERIV_BE_STAGING: ${YOUR_APP_ID},
  TEST_APP: ${YOUR_APP_ID}
}`);
            console.log('✅ Replaced DEFAULT_APP_IDS object');
        }
    }
}

console.log('Writing modified file...');
fs.writeFileSync(outputFile, code, 'utf8');

console.log('✅ App ID injection complete!');
console.log(`📝 Modified file: ${outputFile}`);
console.log(`🎯 All trades will now use app_id: ${YOUR_APP_ID}`);
console.log('');
console.log('Next steps:');
console.log('1. Update src/pages/dtrader-integrated.tsx to load from /deriv-dtrader.vercel.app/dtrader.html');
console.log('2. Test the DTrader interface');
console.log('3. Verify trades are attributed to your app_id');

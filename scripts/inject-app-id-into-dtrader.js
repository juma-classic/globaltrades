/**
 * Script to inject your app_id into the Deriv DTrader built files
 * 
 * WARNING: This is a hacky solution and may break with updates.
 * The integrated DTrader (src/pages/dtrader-integrated.tsx) is the recommended approach.
 */

const fs = require('fs');
const path = require('path');

// YOUR APP ID HERE
const YOUR_APP_ID = '68794'; // Replace with your actual app_id
const DERIV_DEFAULT_APP_ID = '16929'; // Deriv's default app_id

const dtraderDir = path.join(__dirname, '../public/deriv-dtrader.vercel.app');

function replaceAppIdInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace various app_id patterns
        content = content.replace(
            new RegExp(`app_id["\\'\\s]*[:=]["\\'\\s]*${DERIV_DEFAULT_APP_ID}`, 'g'),
            `app_id="${YOUR_APP_ID}"`
        );
        
        content = content.replace(
            new RegExp(`appId["\\'\\s]*[:=]["\\'\\s]*${DERIV_DEFAULT_APP_ID}`, 'g'),
            `appId="${YOUR_APP_ID}"`
        );
        
        content = content.replace(
            new RegExp(`"${DERIV_DEFAULT_APP_ID}"`, 'g'),
            `"${YOUR_APP_ID}"`
        );
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${path.basename(filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dir) {
    let filesUpdated = 0;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            filesUpdated += processDirectory(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
            if (replaceAppIdInFile(filePath)) {
                filesUpdated++;
            }
        }
    }
    
    return filesUpdated;
}

console.log('🔧 Starting app_id injection...');
console.log(`📝 Replacing ${DERIV_DEFAULT_APP_ID} with ${YOUR_APP_ID}`);
console.log('');

if (!fs.existsSync(dtraderDir)) {
    console.error('❌ DTrader directory not found:', dtraderDir);
    process.exit(1);
}

const filesUpdated = processDirectory(dtraderDir);

console.log('');
console.log('✅ Injection complete!');
console.log(`📊 Files updated: ${filesUpdated}`);
console.log('');
console.log('⚠️  WARNING: This is a temporary solution.');
console.log('   The integrated DTrader is the recommended approach.');
console.log('   These changes will be lost if you update the DTrader files.');

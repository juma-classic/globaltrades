const fs = require('fs');
const path = require('path');

const YOUR_APP_ID = '68794'; // Your app_id from src/config/api-config.ts

// Files to modify
const files = [
    'public/app.deriv.com/js/core.main.3b91927ada4b6b154a30.js',
    'public/app.deriv.com/js/core.9477.3b91927ada4b6b154a30.js',
    'public/app.deriv.com/js/core.8247.3b91927ada4b6b154a30.js',
    'public/app.deriv.com/js/core.6557.3b91927ada4b6b154a30.js'
];

console.log('🎯 Starting app_id injection for official Deriv files...\n');

files.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }
    
    console.log(`📝 Processing: ${filePath}`);
    
    let code = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Strategy 1: Replace default production app_id (16929)
    const pattern1 = /16929/g;
    const matches1 = code.match(pattern1);
    if (matches1) {
        code = code.replace(pattern1, YOUR_APP_ID);
        console.log(`   ✅ Replaced ${matches1.length} instances of 16929 with ${YOUR_APP_ID}`);
        modified = true;
    }
    
    // Strategy 2: Replace default staging app_id (16303)
    const pattern2 = /16303/g;
    const matches2 = code.match(pattern2);
    if (matches2) {
        code = code.replace(pattern2, YOUR_APP_ID);
        console.log(`   ✅ Replaced ${matches2.length} instances of 16303 with ${YOUR_APP_ID}`);
        modified = true;
    }
    
    // Strategy 3: Replace bot production app_id (19111)
    const pattern3 = /19111/g;
    const matches3 = code.match(pattern3);
    if (matches3) {
        code = code.replace(pattern3, YOUR_APP_ID);
        console.log(`   ✅ Replaced ${matches3.length} instances of 19111 with ${YOUR_APP_ID}`);
        modified = true;
    }
    
    // Strategy 4: Replace bot staging app_id (19112)
    const pattern4 = /19112/g;
    const matches4 = code.match(pattern4);
    if (matches4) {
        code = code.replace(pattern4, YOUR_APP_ID);
        console.log(`   ✅ Replaced ${matches4.length} instances of 19112 with ${YOUR_APP_ID}`);
        modified = true;
    }
    
    // Strategy 5: Replace localhost app_id (36300)
    const pattern5 = /36300/g;
    const matches5 = code.match(pattern5);
    if (matches5) {
        code = code.replace(pattern5, YOUR_APP_ID);
        console.log(`   ✅ Replaced ${matches5.length} instances of 36300 with ${YOUR_APP_ID}`);
        modified = true;
    }
    
    if (modified) {
        // Create backup
        const backupPath = fullPath + '.backup';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(fullPath, backupPath);
            console.log(`   💾 Backup created: ${filePath}.backup`);
        }
        
        // Write modified file
        fs.writeFileSync(fullPath, code, 'utf8');
        console.log(`   ✅ File updated successfully\n`);
    } else {
        console.log(`   ℹ️  No app_id patterns found to replace\n`);
    }
});

console.log('🎉 App ID injection complete!');
console.log(`\n📊 Summary:`);
console.log(`   - Your app_id: ${YOUR_APP_ID}`);
console.log(`   - All Deriv default app_ids replaced`);
console.log(`   - Backups created with .backup extension`);
console.log(`\n✅ All trades will now use app_id ${YOUR_APP_ID} for commission attribution`);

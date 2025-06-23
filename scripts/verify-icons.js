#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const requiredIcons = [
  'icon.ico',
  'icon.icns', 
  'icon.png',
  'icon.svg'
];

console.log('🔍 Verifying icon files...');
console.log(`Assets directory: ${assetsDir}`);

let allIconsExist = true;

for (const iconFile of requiredIcons) {
  const iconPath = path.join(assetsDir, iconFile);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`✅ ${iconFile} - ${Math.round(stats.size / 1024)}KB`);
  } else {
    console.error(`❌ Missing: ${iconFile}`);
    allIconsExist = false;
  }
}

if (!allIconsExist) {
  console.error('\n🚨 Some icon files are missing!');
  process.exit(1);
}

console.log('\n🎉 All icon files verified successfully!'); 
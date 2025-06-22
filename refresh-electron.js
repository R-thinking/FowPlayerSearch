#!/usr/bin/env node

/**
 * Utility script to refresh Electron app and clear cache
 * Run this if you're still experiencing cache issues
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Refreshing Electron App...');

// Function to clear Electron cache directories
function clearElectronCache() {
  const possibleCacheDirs = [
    path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'fowcrawler'),
    path.join(process.env.HOME || process.env.USERPROFILE, 'Library', 'Caches', 'fowcrawler'),
    path.join(process.env.HOME || process.env.USERPROFILE, 'AppData', 'Local', 'fowcrawler', 'User Data'),
  ];

  possibleCacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🗑️  Clearing cache: ${dir}`);
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('✅ Cache cleared');
      } catch (err) {
        console.log(`⚠️  Could not clear cache: ${err.message}`);
      }
    }
  });
}

// Clear local build cache
console.log('🗑️  Clearing local build cache...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('node_modules/.cache')) {
  fs.rmSync('node_modules/.cache', { recursive: true, force: true });
}

// Clear Electron cache
clearElectronCache();

// Kill existing processes
console.log('🔄 Stopping existing processes...');
exec('pkill -f "electron|vite|python.*run.py" || true', (error) => {
  if (error && error.code !== 1) {
    console.log(`Warning: ${error.message}`);
  }
  
  console.log('✅ Processes stopped');
  console.log('🚀 Ready to restart with: npm run dev:full');
  console.log('💡 Or use: npm run dev:fresh (includes cache clearing)');
}); 
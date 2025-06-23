#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐍 Testing Python dependency installation...\n');

// Check if requirements.txt exists
const requirementsPath = path.join(__dirname, '..', 'requirements.txt');
if (!fs.existsSync(requirementsPath)) {
  console.error('❌ requirements.txt not found!');
  process.exit(1);
}

console.log('📋 Requirements file found');
const requirements = fs.readFileSync(requirementsPath, 'utf8');
console.log('Dependencies to install:');
requirements.split('\n').filter(line => line.trim()).forEach(line => {
  console.log(`  - ${line}`);
});
console.log();

// Test pip installation
console.log('🔧 Testing pip installation...');

const pythonProcess = spawn('python', ['-m', 'pip', 'install', '-r', 'requirements.txt', '--dry-run', '--quiet'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: path.join(__dirname, '..')
});

let output = '';
let errorOutput = '';

pythonProcess.stdout.on('data', (data) => {
  output += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

pythonProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Python dependencies can be installed successfully!');
    if (output.trim()) {
      console.log('\nOutput:', output.trim());
    }
  } else {
    console.error('❌ Python dependency installation test failed!');
    console.error('Exit code:', code);
    if (errorOutput.trim()) {
      console.error('Error output:', errorOutput.trim());
    }
    if (output.trim()) {
      console.error('Standard output:', output.trim());
    }
  }
  
  console.log('\n💡 If this fails, you can still build the Electron app.');
  console.log('   The Python dependencies will be installed at runtime.');
});

pythonProcess.on('error', (error) => {
  console.error('❌ Failed to run Python:', error.message);
  console.log('\n💡 Make sure Python is installed and accessible via "python" command.');
}); 
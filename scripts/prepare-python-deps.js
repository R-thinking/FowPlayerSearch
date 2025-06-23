#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐍 Preparing Python dependencies for packaging...');

const projectRoot = path.join(__dirname, '..');
const pythonApiPath = path.join(projectRoot, 'python_api');
const requirementsPath = path.join(projectRoot, 'requirements.txt');
const localPythonPath = path.join(pythonApiPath, 'python_packages');

// Create local python packages directory
if (!fs.existsSync(localPythonPath)) {
  fs.mkdirSync(localPythonPath, { recursive: true });
  console.log(`📁 Created directory: ${localPythonPath}`);
}

// Function to try different Python executables
const tryPythonExecutables = (executables, index = 0) => {
  if (index >= executables.length) {
    console.error('❌ No Python executable found. Please install Python 3.8+');
    process.exit(1);
  }

  const pythonExe = executables[index];
  console.log(`🔍 Trying Python executable: ${pythonExe}`);

  const installProcess = spawn(pythonExe, [
    '-m', 'pip', 'install',
    '-r', requirementsPath,
    '--target', localPythonPath,
    '--no-deps', // Don't install dependencies of dependencies to avoid conflicts
    '--upgrade',
    '--no-warn-script-location',
    '--disable-pip-version-check'
  ], {
    stdio: 'inherit',
    cwd: projectRoot
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Python dependencies installed successfully!');
      console.log(`📦 Dependencies installed to: ${localPythonPath}`);
      
      // Verify installation
      const installedPackages = fs.readdirSync(localPythonPath).filter(item => 
        fs.statSync(path.join(localPythonPath, item)).isDirectory()
      );
      console.log(`📋 Installed packages: ${installedPackages.join(', ')}`);
      
      // Create a simple verification file
      const verificationFile = path.join(localPythonPath, 'PACKAGES_INSTALLED.txt');
      fs.writeFileSync(verificationFile, 
        `Python packages installed on: ${new Date().toISOString()}\n` +
        `Packages: ${installedPackages.join(', ')}\n` +
        `Python executable: ${pythonExe}\n`
      );
      
      process.exit(0);
    } else {
      console.log(`❌ Python executable ${pythonExe} failed with code ${code}`);
      tryPythonExecutables(executables, index + 1);
    }
  });

  installProcess.on('error', (error) => {
    console.log(`❌ Error with ${pythonExe}: ${error.message}`);
    tryPythonExecutables(executables, index + 1);
  });
};

// Check if requirements.txt exists
if (!fs.existsSync(requirementsPath)) {
  console.error(`❌ requirements.txt not found at: ${requirementsPath}`);
  process.exit(1);
}

// Try different Python executables based on platform
const pythonExecutables = process.platform === 'win32' 
  ? ['python', 'python3', 'py', 'python.exe']
  : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];

console.log(`📋 Requirements file: ${requirementsPath}`);
console.log(`📁 Target directory: ${localPythonPath}`);

tryPythonExecutables(pythonExecutables); 
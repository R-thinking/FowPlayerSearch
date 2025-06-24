#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Python API executable with PyInstaller...');

const projectRoot = path.join(__dirname, '..');
const pythonApiPath = path.join(projectRoot, 'python_api');
const requirementsPath = path.join(projectRoot, 'requirements.txt');
const buildScript = path.join(pythonApiPath, 'build_exe.py');

// Function to try different Python executables
const tryPythonExecutables = (executables, index = 0) => {
  if (index >= executables.length) {
    console.error('❌ No Python executable found. Please install Python 3.8+');
    console.error('💡 Make sure to install PyInstaller: pip install pyinstaller');
    process.exit(1);
  }

  const pythonExe = executables[index];
  console.log(`🔍 Trying Python executable: ${pythonExe}`);

  // First, check if PyInstaller is available
  const checkProcess = spawn(pythonExe, [buildScript, '--check'], {
    stdio: 'inherit',
    cwd: pythonApiPath
  });

  checkProcess.on('close', (checkCode) => {
    if (checkCode === 0) {
      console.log(`✅ PyInstaller available with ${pythonExe}`);
      
      // Now build the executable
      console.log('🚀 Building executable...');
      const buildProcess = spawn(pythonExe, [buildScript], {
        stdio: 'inherit',
        cwd: pythonApiPath
      });

      buildProcess.on('close', (buildCode) => {
        if (buildCode === 0) {
          console.log('✅ PyInstaller executable built successfully!');
          
          // Verify the executable was created
          const executableName = process.platform === 'win32' ? 'fowcrawler-api.exe' : 'fowcrawler-api';
          const executablePath = path.join(pythonApiPath, 'dist', executableName);
          
          if (fs.existsSync(executablePath)) {
            const stats = fs.statSync(executablePath);
            console.log(`📦 Executable created: ${executablePath}`);
            console.log(`📏 File size: ${(stats.size / (1024*1024)).toFixed(1)} MB`);
            
            // Make executable on Unix-like systems
            if (process.platform !== 'win32') {
              try {
                fs.chmodSync(executablePath, '755');
                console.log('🔧 Made executable file executable');
              } catch (error) {
                console.warn('⚠️ Could not set executable permissions:', error.message);
              }
            }
            
            // Create verification file
            const verificationFile = path.join(pythonApiPath, 'dist', 'BUILD_INFO.txt');
            fs.writeFileSync(verificationFile, 
              `PyInstaller executable built on: ${new Date().toISOString()}\n` +
              `Platform: ${process.platform}\n` +
              `Python executable: ${pythonExe}\n` +
              `Executable: ${executableName}\n` +
              `Size: ${(stats.size / (1024*1024)).toFixed(1)} MB\n`
            );
            
            console.log('🎉 Python API is now bundled as a standalone executable!');
            console.log('💡 No Python installation required on target systems.');
            process.exit(0);
          } else {
            console.error('❌ Executable not found after build');
            process.exit(1);
          }
        } else {
          console.log(`❌ Build failed with ${pythonExe} (code ${buildCode})`);
          tryPythonExecutables(executables, index + 1);
        }
      });

      buildProcess.on('error', (error) => {
        console.log(`❌ Build error with ${pythonExe}: ${error.message}`);
        tryPythonExecutables(executables, index + 1);
      });

    } else {
      console.log(`❌ PyInstaller check failed with ${pythonExe} (code ${checkCode})`);
      tryPythonExecutables(executables, index + 1);
    }
  });

  checkProcess.on('error', (error) => {
    console.log(`❌ Error with ${pythonExe}: ${error.message}`);
    tryPythonExecutables(executables, index + 1);
  });
};

// Check if build script exists
if (!fs.existsSync(buildScript)) {
  console.error(`❌ Build script not found at: ${buildScript}`);
  process.exit(1);
}

// Check if requirements.txt exists
if (!fs.existsSync(requirementsPath)) {
  console.error(`❌ requirements.txt not found at: ${requirementsPath}`);
  process.exit(1);
}

// Try different Python executables based on platform
const pythonExecutables = process.platform === 'win32' 
  ? ['python', 'python3', 'py', 'python.exe']
  : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];

console.log(`📋 Build script: ${buildScript}`);
console.log(`📁 Output directory: ${path.join(pythonApiPath, 'dist')}`);

tryPythonExecutables(pythonExecutables); 
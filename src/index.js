const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let pythonProcess = null;

const startPythonAPI = () => {
  if (isDev) {
    // In development, assume API is started manually
    console.log('Development mode: Python API should be started manually with "npm run dev:api"');
    return;
  }

  try {
    // In production, the python_api folder is in the resources directory
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
    const pythonApiPath = path.join(resourcesPath, 'python_api');
    const pythonScript = path.join(pythonApiPath, 'run.py');
    const pythonPackagesPath = path.join(pythonApiPath, 'python_packages');
    
    console.log('=== Python API Startup Debug ===');
    console.log('Platform:', process.platform);
    console.log('App packaged:', app.isPackaged);
    console.log('Resources path:', resourcesPath);
    console.log('Python API path:', pythonApiPath);
    console.log('Python script:', pythonScript);
    console.log('Python packages path:', pythonPackagesPath);
    
    // Check if files exist
    const fs = require('fs');
    console.log('Python API directory exists:', fs.existsSync(pythonApiPath));
    console.log('Python script exists:', fs.existsSync(pythonScript));
    console.log('Python packages directory exists:', fs.existsSync(pythonPackagesPath));
    
    if (fs.existsSync(pythonPackagesPath)) {
      const packages = fs.readdirSync(pythonPackagesPath).filter(item => 
        fs.statSync(path.join(pythonPackagesPath, item)).isDirectory()
      );
      console.log('Available Python packages:', packages.join(', '));
    }
    
    if (!fs.existsSync(pythonScript)) {
      console.error('❌ Python script not found! App may not work properly.');
      console.log('Contents of resources directory:', fs.readdirSync(resourcesPath));
      return;
    }
    
    // Try different Python executables based on platform
    const pythonExecutables = process.platform === 'win32' 
      ? ['python', 'python3', 'py', 'python.exe']
      : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];
    
    let currentExecutableIndex = 0;
    let pythonCheckResults = [];
    
    const tryStartPython = () => {
      if (currentExecutableIndex >= pythonExecutables.length) {
        console.error('❌ All Python executables failed. Python API will not start.');
        console.error('🐍 Python check results:', pythonCheckResults);
        
        if (process.platform === 'win32') {
          console.error('\n🔧 WINDOWS TROUBLESHOOTING STEPS:');
          console.error('1. Install Python from https://www.python.org/downloads/windows/');
          console.error('2. During installation, check "Add Python to PATH"');
          console.error('3. Restart your computer after installation');
          console.error('4. Open Command Prompt and verify: python --version');
          console.error('5. If still not working, try running as Administrator');
          console.error('6. Check Windows Defender - it may be blocking Python');
        }
        return;
      }
      
      const pythonExe = pythonExecutables[currentExecutableIndex];
      console.log(`🐍 Trying Python executable: ${pythonExe}`);
      
      // Start Python process
      pythonProcess = spawn(pythonExe, [pythonScript], {
        cwd: pythonApiPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          PYTHONPATH: fs.existsSync(pythonPackagesPath) 
            ? `${pythonPackagesPath}${path.delimiter}${pythonApiPath}${path.delimiter}${process.env.PYTHONPATH || ''}`
            : pythonApiPath
        }
      });

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`🐍 Python API stdout: ${output}`);
        
        // Check if server started successfully
        if (output.includes('Running on') || output.includes('Flask') || output.includes('5002')) {
          console.log('✅ Python API server started successfully on port 5002!');
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error(`🐍 Python API stderr: ${error}`);
        
        // Check for common errors and provide specific help
        if (error.includes('ModuleNotFoundError') || error.includes('ImportError')) {
          console.error('❌ Python dependencies missing.');
          if (process.platform === 'win32') {
            console.error('💡 Try running: pip install flask flask-cors selenium beautifulsoup4 pandas requests');
          }
        }
        
        if (error.includes('Permission denied') || error.includes('Access is denied')) {
          console.error('❌ Permission denied - try running as Administrator');
        }
        
        if (error.includes('No module named')) {
          console.error('❌ Missing Python module - dependencies not properly installed');
        }
      });

      pythonProcess.on('close', (code) => {
        const result = `${pythonExe}: exited with code ${code}`;
        pythonCheckResults.push(result);
        console.log(`🐍 Python process result: ${result}`);
        pythonProcess = null;
        
        if (code !== 0 && currentExecutableIndex < pythonExecutables.length - 1) {
          console.log('⚠️ Python process failed, trying next executable...');
          currentExecutableIndex++;
          setTimeout(tryStartPython, 1000);
        } else if (code !== 0) {
          console.error('❌ Final Python executable failed. No more options to try.');
        }
      });

      pythonProcess.on('error', (error) => {
        const result = `${pythonExe}: ${error.message}`;
        pythonCheckResults.push(result);
        console.error(`🐍 Failed to start Python with ${pythonExe}: ${error.message}`);
        
        // Provide specific error help
        if (error.code === 'ENOENT') {
          console.error(`❌ ${pythonExe} not found in PATH`);
        } else if (error.code === 'EACCES') {
          console.error(`❌ Permission denied for ${pythonExe}`);
        }
        
        pythonProcess = null;
        
        // Try next executable
        currentExecutableIndex++;
        setTimeout(tryStartPython, 1000);
      });
    };
    
    // Start the first attempt
    tryStartPython();

  } catch (error) {
    console.error('❌ Error in startPythonAPI:', error);
    if (process.platform === 'win32') {
      console.error('🔧 This may be a Windows-specific issue. Check the troubleshooting steps above.');
    }
  }
};

const stopPythonAPI = () => {
  if (pythonProcess) {
    console.log('Stopping Python API server...');
    pythonProcess.kill();
    pythonProcess = null;
  }
};

const createWindow = () => {
  // Get the primary display's size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // Calculate 70% of screen dimensions
  const windowWidth = Math.floor(screenWidth * 0.7);
  const windowHeight = Math.floor(screenHeight * 0.7);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: isDev ? false : true, // Disable web security in dev for easier CORS
    },
  });

  // Load from Vite dev server in development, or built files in production
  if (isDev) {
    // Disable cache in development
    mainWindow.webContents.session.clearCache();
    
    // Load the Vite dev server
    mainWindow.loadURL('http://localhost:3000');
    
    // Enable DevTools in development
    mainWindow.webContents.openDevTools();
    
    // Reload the window when the dev server updates
    mainWindow.webContents.on('did-fail-load', () => {
      console.log('Failed to load, retrying in 1 second...');
      setTimeout(() => {
        mainWindow.reload();
      }, 1000);
    });
    
    // Add keyboard shortcut for manual reload (Cmd+R or Ctrl+R)
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
        console.log('Manual reload triggered');
        mainWindow.webContents.session.clearCache();
        mainWindow.reload();
      }
    });
    
  } else {
    // In production, the dist folder is in the app resources
    const fs = require('fs');
    let htmlPath;
    
    // Try different possible locations for the HTML file
    const possiblePaths = [
      path.join(__dirname, 'dist/index.html'), // Most likely location (src/dist from src/index.js)
      path.join(process.resourcesPath, 'dist/index.html'), // extraResource location
      path.join(__dirname, '../dist/index.html'),
      path.join(process.resourcesPath, 'app/dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
      // If dist is in extraResource, it will be in the resources folder
      path.join(process.resourcesPath, 'extraResources/dist/index.html')
    ];
    
    console.log('=== HTML File Loading Debug ===');
    console.log('__dirname:', __dirname);
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('app.isPackaged:', app.isPackaged);
    console.log('app.getAppPath():', app.getAppPath());
    
    for (const testPath of possiblePaths) {
      console.log(`Checking HTML path: ${testPath}`);
      if (fs.existsSync(testPath)) {
        htmlPath = testPath;
        console.log(`✅ Found HTML file at: ${htmlPath}`);
        break;
      }
    }
    
    if (!htmlPath) {
      console.error('❌ Could not find index.html file!');
      console.log('Available directories:');
      try {
        console.log('Contents of __dirname:', fs.readdirSync(__dirname));
        if (fs.existsSync(path.join(__dirname, '..'))) {
          console.log('Contents of __dirname/../:', fs.readdirSync(path.join(__dirname, '..')));
        }
        if (process.resourcesPath && fs.existsSync(process.resourcesPath)) {
          console.log('Contents of resourcesPath:', fs.readdirSync(process.resourcesPath));
        }
        if (process.resourcesPath && fs.existsSync(path.join(process.resourcesPath, 'extraResources'))) {
          console.log('Contents of extraResources:', fs.readdirSync(path.join(process.resourcesPath, 'extraResources')));
        }
      } catch (error) {
        console.error('Error reading directories:', error);
      }
      // Fallback to the most common path
      htmlPath = path.join(__dirname, '../dist/index.html');
    }
    
    console.log(`Loading HTML from: ${htmlPath}`);
    mainWindow.loadFile(htmlPath);
  }
  
  // Note: Removed auto-reload on focus to preserve React app state
  // Manual reload is still available with Cmd+R/Ctrl+R
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Disable cache in development
  if (isDev) {
    app.commandLine.appendSwitch('--disable-http-cache');
    app.commandLine.appendSwitch('--disable-web-security');
  }
  
  // Start Python API server
  startPythonAPI();
  
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  stopPythonAPI();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ensure Python API is stopped when app quits
app.on('before-quit', () => {
  stopPythonAPI();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

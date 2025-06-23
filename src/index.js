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
    
    console.log('=== Python API Startup Debug ===');
    console.log('Platform:', process.platform);
    console.log('App packaged:', app.isPackaged);
    console.log('Resources path:', resourcesPath);
    console.log('Python API path:', pythonApiPath);
    console.log('Python script:', pythonScript);
    
    // Check if files exist
    const fs = require('fs');
    console.log('Python API directory exists:', fs.existsSync(pythonApiPath));
    console.log('Python script exists:', fs.existsSync(pythonScript));
    
    if (!fs.existsSync(pythonScript)) {
      console.error('Python script not found! App may not work properly.');
      console.log('Contents of resources directory:', fs.readdirSync(resourcesPath));
      return;
    }
    
    // Try different Python executables based on platform
    const pythonExecutables = process.platform === 'win32' 
      ? ['python', 'python3', 'py', 'python.exe']
      : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];
    
    let currentExecutableIndex = 0;
    
    const tryStartPython = () => {
      if (currentExecutableIndex >= pythonExecutables.length) {
        console.error('All Python executables failed. Python API will not start.');
        return;
      }
      
      const pythonExe = pythonExecutables[currentExecutableIndex];
      console.log(`Trying Python executable: ${pythonExe}`);
      
      // Start Python process
      pythonProcess = spawn(pythonExe, [pythonScript], {
        cwd: pythonApiPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONPATH: pythonApiPath }
      });

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`Python API stdout: ${output}`);
        
        // Check if server started successfully
        if (output.includes('Running on') || output.includes('Flask') || output.includes('5000')) {
          console.log('✅ Python API server started successfully!');
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error(`Python API stderr: ${error}`);
        
        // Check for common errors
        if (error.includes('ModuleNotFoundError') || error.includes('ImportError')) {
          console.error('❌ Python dependencies missing. Please install required packages.');
        }
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python API process exited with code ${code}`);
        pythonProcess = null;
        
        if (code !== 0 && currentExecutableIndex < pythonExecutables.length - 1) {
          console.log('Python process failed, trying next executable...');
          currentExecutableIndex++;
          setTimeout(tryStartPython, 1000);
        }
      });

      pythonProcess.on('error', (error) => {
        console.error(`Failed to start Python with ${pythonExe}:`, error.message);
        pythonProcess = null;
        
        // Try next executable
        currentExecutableIndex++;
        setTimeout(tryStartPython, 1000);
      });
    };
    
    // Start the first attempt
    tryStartPython();

  } catch (error) {
    console.error('Error in startPythonAPI:', error);
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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

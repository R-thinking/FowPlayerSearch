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
    
    console.log('Starting Python API server...');
    console.log('Resources path:', resourcesPath);
    console.log('Python API path:', pythonApiPath);
    console.log('Python script:', pythonScript);
    
    // Try different Python executables (python, python3, py)
    const pythonExecutables = ['python', 'python3', 'py'];
    let pythonExe = 'python';
    
    // Start Python process
    pythonProcess = spawn(pythonExe, [pythonScript], {
      cwd: pythonApiPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python API: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python API Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python API process exited with code ${code}`);
      pythonProcess = null;
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python API:', error);
      // Try alternative Python executables
      if (pythonExecutables.length > 1) {
        pythonExecutables.shift();
        pythonExe = pythonExecutables[0];
        console.log(`Trying alternative Python executable: ${pythonExe}`);
        // Recursive retry with different executable
        setTimeout(() => startPythonAPI(), 1000);
      }
      pythonProcess = null;
    });

  } catch (error) {
    console.error('Error starting Python API:', error);
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

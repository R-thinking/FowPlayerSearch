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
    // In production, use the PyInstaller executable
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
    const pythonApiPath = path.join(resourcesPath, 'python_api');
    
    // Determine executable name based on platform
    const executableName = process.platform === 'win32' ? 'fowcrawler-api.exe' : 'fowcrawler-api';
    const executablePath = path.join(pythonApiPath, 'dist', executableName);
    
    console.log('=== PyInstaller Executable Startup ===');
    console.log('Platform:', process.platform);
    console.log('App packaged:', app.isPackaged);
    console.log('Resources path:', resourcesPath);
    console.log('Python API path:', pythonApiPath);
    console.log('Executable path:', executablePath);
    
    // Check if executable exists
    const fs = require('fs');
    console.log('Python API directory exists:', fs.existsSync(pythonApiPath));
    console.log('Executable exists:', fs.existsSync(executablePath));
    
    if (!fs.existsSync(executablePath)) {
      console.error('❌ PyInstaller executable not found!');
      console.log('Expected location:', executablePath);
      
      // Try to find the executable in alternative locations
      const alternativePaths = [
        path.join(pythonApiPath, executableName), // Direct in python_api folder
        path.join(resourcesPath, executableName),
        path.join(resourcesPath, 'dist', executableName),
        path.join(resourcesPath, 'python_api', 'dist', executableName), // Full old path
      ];
      
      let foundPath = null;
      for (const altPath of alternativePaths) {
        console.log('Checking alternative path:', altPath);
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          console.log('✅ Found executable at alternative location:', foundPath);
          break;
        }
      }
      
      if (!foundPath) {
        console.error('❌ Could not find PyInstaller executable anywhere!');
        console.log('Directory contents:');
        try {
          if (fs.existsSync(pythonApiPath)) {
            console.log('python_api contents:', fs.readdirSync(pythonApiPath));
          }
          if (fs.existsSync(path.join(pythonApiPath, 'dist'))) {
            console.log('python_api/dist contents:', fs.readdirSync(path.join(pythonApiPath, 'dist')));
          }
          if (fs.existsSync(resourcesPath)) {
            console.log('resources contents:', fs.readdirSync(resourcesPath));
          }
        } catch (error) {
          console.error('Error reading directories:', error);
        }
        return;
      }
      
      // Update executable path to the found location
      executablePath = foundPath;
    }
    
    console.log(`🚀 Starting PyInstaller executable: ${executablePath}`);
    
    // Start the PyInstaller executable directly
    pythonProcess = spawn(executablePath, [], {
      cwd: path.dirname(executablePath),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`🐍 API stdout: ${output}`);
      
      // Check if server started successfully
      if (output.includes('Running on') || output.includes('Flask') || output.includes('5002')) {
        console.log('✅ PyInstaller API server started successfully on port 5002!');
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      console.error(`🐍 API stderr: ${error}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`🐍 PyInstaller API process exited with code ${code}`);
      pythonProcess = null;
      
      if (code !== 0) {
        console.error('❌ PyInstaller API process failed to start or crashed');
      }
    });

    pythonProcess.on('error', (error) => {
      console.error(`🐍 Failed to start PyInstaller executable: ${error.message}`);
      pythonProcess = null;
      
      // Provide specific error help
      if (error.code === 'ENOENT') {
        console.error(`❌ Executable not found: ${executablePath}`);
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied for executable: ${executablePath}`);
        if (process.platform !== 'win32') {
          console.error('💡 Try: chmod +x ' + executablePath);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in startPythonAPI:', error);
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
      path.join(process.resourcesPath, 'frontend-dist/index.html'), // New extraResource location
      path.join(process.resourcesPath, 'dist/index.html'), // Old extraResource location
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

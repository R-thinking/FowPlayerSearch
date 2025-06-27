const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let pythonProcess = null;

// Startup status tracking
let startupStatus = {
  stage: 'initializing', // initializing, starting_api, api_ready, error
  message: 'Initializing application...',
  timestamp: Date.now(),
  apiReady: false,
  error: null
};

// Track if we're already checking API readiness
let isCheckingAPI = false;

// Update startup status and notify renderer
const updateStartupStatus = (stage, message, error = null) => {
  startupStatus = {
    stage,
    message,
    timestamp: Date.now(),
    apiReady: stage === 'api_ready',
    error
  };
  
  console.log(`📊 Startup Status: ${stage} - ${message}`);
  
  // Send to all renderer processes
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('startup-status-update', startupStatus);
  });
};

// IPC handler for getting current startup status
ipcMain.handle('get-startup-status', () => {
  return startupStatus;
});

const startPythonAPI = () => {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In development, assume API is started manually
      updateStartupStatus('api_ready', 'Development mode: API should be started manually');
      console.log('Development mode: Python API should be started manually with "npm run dev:api"');
      resolve();
      return;
    }

    updateStartupStatus('starting_api', 'Locating PyInstaller executable...');

    try {
      // In production, use the PyInstaller executable
      const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
      
      // Determine executable name based on platform
      const executableName = process.platform === 'win32' ? 'fowcrawler-api.exe' : 'fowcrawler-api';
      
      // The extraResource puts the PyInstaller executable directly in Resources/dist/
      let executablePath = path.join(resourcesPath, 'dist', executableName);
      
      console.log('=== PyInstaller Executable Startup ===');
      console.log('Platform:', process.platform);
      console.log('App packaged:', app.isPackaged);
      console.log('Resources path:', resourcesPath);
      console.log('Executable name:', executableName);
      console.log('Executable path:', executablePath);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('Process argv:', process.argv);
      
      // Check if executable exists
      const fs = require('fs');
      console.log('Resources directory exists:', fs.existsSync(resourcesPath));
      console.log('Dist directory exists:', fs.existsSync(path.join(resourcesPath, 'dist')));
      console.log('Executable exists:', fs.existsSync(executablePath));
      
      // Windows-specific debugging
      if (process.platform === 'win32') {
        console.log('=== Windows-specific debugging ===');
        console.log('__dirname:', __dirname);
        console.log('process.cwd():', process.cwd());
        console.log('app.getAppPath():', app.getAppPath());
        
        // Check for Windows-specific paths
        const winPaths = [
          path.join(resourcesPath, 'app.asar.unpacked', 'dist', executableName),
          path.join(resourcesPath, 'extraResources', 'dist', executableName),
          path.join(__dirname, '..', 'dist', executableName),
        ];
        
        for (const winPath of winPaths) {
          console.log(`Windows path check: ${winPath} exists: ${fs.existsSync(winPath)}`);
        }
      }
      
      if (!fs.existsSync(executablePath)) {
        updateStartupStatus('starting_api', 'Searching for executable in alternative locations...');
        console.error('❌ PyInstaller executable not found!');
        console.log('Expected location:', executablePath);
        
        // Try to find the executable in alternative locations
        const alternativePaths = [
          path.join(resourcesPath, executableName), // Direct in resources
          path.join(resourcesPath, 'python_api', 'dist', executableName), // Old structure
          path.join(resourcesPath, 'app.asar.unpacked', 'dist', executableName), // If somehow in asar
          path.join(resourcesPath, 'extraResources', 'dist', executableName), // Alternative extraResource location
          path.join(__dirname, '..', 'dist', executableName), // Relative to main process
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
          const errorMsg = 'PyInstaller executable not found in any expected location';
          updateStartupStatus('error', errorMsg, 'EXECUTABLE_NOT_FOUND');
          console.error('❌ Could not find PyInstaller executable anywhere!');
          console.log('=== Directory structure debugging ===');
          try {
            if (fs.existsSync(resourcesPath)) {
              const resourcesContents = fs.readdirSync(resourcesPath);
              console.log('resources contents:', resourcesContents);
              
              // Check each subdirectory
              for (const item of resourcesContents) {
                const itemPath = path.join(resourcesPath, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                  console.log(`${item}/ contents:`, fs.readdirSync(itemPath));
                }
              }
            }
            
            if (fs.existsSync(path.join(resourcesPath, 'dist'))) {
              console.log('resources/dist contents:', fs.readdirSync(path.join(resourcesPath, 'dist')));
            }
          } catch (error) {
            console.error('Error reading directories:', error);
          }
          reject(new Error('PyInstaller executable not found'));
          return;
        }
        
        // Update executable path to the found location
        executablePath = foundPath;
      }
      
      updateStartupStatus('starting_api', 'Starting PyInstaller API server...');
      console.log(`🚀 Starting PyInstaller executable: ${executablePath}`);
      
      // Windows-specific spawn options
      const spawnOptions = {
        cwd: path.dirname(executablePath),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
        shell: process.platform === 'win32', // Use shell on Windows for better compatibility
      };
      
      // On Windows, also try without shell if the first attempt fails
      console.log('Spawn options:', spawnOptions);
      
      // Start the PyInstaller executable directly
      pythonProcess = spawn(executablePath, [], spawnOptions);

      // Function to check if API is ready
      const checkAPIReady = async () => {
        return new Promise((resolve) => {
          const req = http.request({
            hostname: 'localhost',
            port: 5002,
            path: '/api/health',
            method: 'GET',
            timeout: 2000,
          }, (res) => {
            resolve(res.statusCode === 200);
          });
          
          req.on('error', () => {
            resolve(false);
          });
          
          req.on('timeout', () => {
            resolve(false);
          });
          
          req.end();
        });
      };

      // Wait for API to be ready with timeout
      const waitForAPI = async () => {
        // Prevent multiple concurrent API checks
        if (isCheckingAPI) {
          console.log('🔄 API check already in progress, skipping...');
          return;
        }
        
        isCheckingAPI = true;
        const maxWaitTime = 60000; // 60 seconds max wait
        const checkInterval = 1000; // Check every 1 second
        const startTime = Date.now();
        
        updateStartupStatus('starting_api', 'Waiting for API server to initialize...');
        console.log('⏳ Waiting for PyInstaller API to be ready...');
        
        while (Date.now() - startTime < maxWaitTime) {
          if (await checkAPIReady()) {
            updateStartupStatus('api_ready', 'API server is ready and responding');
            console.log('✅ PyInstaller API is ready!');
            isCheckingAPI = false;
            resolve();
            return;
          }
          
          // Update status with elapsed time
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          updateStartupStatus('starting_api', `Initializing API server... (${elapsed}s)`);
          
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        const errorMsg = 'Timeout waiting for API server to start (60s)';
        updateStartupStatus('error', errorMsg, 'API_TIMEOUT');
        console.error('❌ Timeout waiting for PyInstaller API to start');
        isCheckingAPI = false;
        reject(new Error('API startup timeout'));
      };

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`🐍 API stdout: ${output}`);
        
        // Check if server started successfully and we're not already checking
        if ((output.includes('Running on') || output.includes('Flask') || output.includes('5002')) && !isCheckingAPI) {
          updateStartupStatus('starting_api', 'API server started, checking connectivity...');
          console.log('✅ PyInstaller API server started successfully on port 5002!');
          // Start checking API readiness when we see startup messages
          setTimeout(waitForAPI, 1000);
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error(`🐍 API stderr: ${error}`);
        
        // Update status with error info
        if (error.includes('Error') || error.includes('Failed') || error.includes('Exception')) {
          updateStartupStatus('starting_api', `API startup warning: ${error.substring(0, 100)}...`);
        }
      });

      pythonProcess.on('close', (code) => {
        console.log(`🐍 PyInstaller API process exited with code ${code}`);
        pythonProcess = null;
        isCheckingAPI = false; // Reset checking flag
        
        if (code !== 0) {
          const errorMsg = `API process exited unexpectedly (code: ${code})`;
          updateStartupStatus('error', errorMsg, 'PROCESS_EXIT');
          console.error('❌ PyInstaller API process failed to start or crashed');
          reject(new Error(`PyInstaller process exited with code ${code}`));
          
          // On Windows, try alternative spawn method if the first failed
          if (process.platform === 'win32' && !spawnOptions.shell) {
            console.log('🔄 Retrying with shell=true on Windows...');
            setTimeout(() => {
              startPythonAPI().then(resolve).catch(reject);
            }, 1000);
          }
        }
      });

      pythonProcess.on('error', (error) => {
        console.error(`🐍 Failed to start PyInstaller executable: ${error.message}`);
        console.error('Error details:', error);
        pythonProcess = null;
        isCheckingAPI = false; // Reset checking flag
        
        // Provide specific error help
        let errorMsg = `Failed to start API: ${error.message}`;
        let errorCode = 'SPAWN_ERROR';
        
        if (error.code === 'ENOENT') {
          errorMsg = 'API executable not found';
          errorCode = 'EXECUTABLE_NOT_FOUND';
          console.error(`❌ Executable not found: ${executablePath}`);
        } else if (error.code === 'EACCES') {
          errorMsg = 'Permission denied for API executable';
          errorCode = 'PERMISSION_DENIED';
          console.error(`❌ Permission denied for executable: ${executablePath}`);
          if (process.platform !== 'win32') {
            console.error('💡 Try: chmod +x ' + executablePath);
          }
        } else if (error.code === 'EBUSY') {
          errorMsg = 'API executable is busy or locked';
          errorCode = 'EXECUTABLE_BUSY';
          console.error(`❌ Executable is busy or locked: ${executablePath}`);
        }
        
        updateStartupStatus('error', errorMsg, errorCode);
        reject(error);
        
        // On Windows, try alternative spawn method if the first failed
        if (process.platform === 'win32' && spawnOptions.shell) {
          console.log('🔄 Retrying without shell on Windows...');
          setTimeout(() => {
            spawnOptions.shell = false;
            pythonProcess = spawn(executablePath, [], spawnOptions);
          }, 1000);
        }
      });

    } catch (error) {
      const errorMsg = `Unexpected error during API startup: ${error.message}`;
      updateStartupStatus('error', errorMsg, 'UNEXPECTED_ERROR');
      console.error('❌ Error in startPythonAPI:', error);
      reject(error);
    }
  });
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
  const windowWidth = Math.floor(screenWidth * 0.85);
  const windowHeight = Math.floor(screenHeight * 0.9);

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
  
  // Start Python API server (don't wait for it)
  startPythonAPI().catch((error) => {
    console.error('❌ Error starting Python API:', error);
  });
  
  // Create window immediately to show startup progress
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
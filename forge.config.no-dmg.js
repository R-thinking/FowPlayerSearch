const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'FowCrawler',
    productName: 'FowCrawler',
    executableName: 'FowCrawler',
    icon: path.join(__dirname, 'assets', 'icon'), // More robust path handling
    appBundleId: 'com.rthinking.fowcrawler',
    extraResource: [
      './python_api',
      './requirements.txt',
      './src/dist'
    ],
    win32metadata: {
      CompanyName: 'r-thinking',
      ProductName: 'FowCrawler',
      FileDescription: 'League of Legends Player Ranking Crawler',
      OriginalFilename: 'FowCrawler.exe',
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'FowCrawler',
        authors: 'r-thinking',
        exe: 'FowCrawler.exe',
        setupExe: 'FowCrawler-Setup.exe',
        setupIcon: path.join(__dirname, 'assets', 'icon.ico'), // Absolute path to ICO file
        noMsi: true, // Set to false if you want MSI installer too
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
      config: {
        // ZIP only - no DMG to avoid hdiutil issues
      }
    },
    // DMG maker removed for fallback configuration
  ],
  plugins: [
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}; 
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');
const packageJson = require('./package.json');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'FowCrawler',
    productName: 'FowCrawler',
    executableName: 'FowCrawler',
    icon: path.join(__dirname, 'assets', 'icon'), // More robust path handling
    appBundleId: 'com.rthinking.fowcrawler',
    extraResource: [
      './python_api/dist',
      './python_api/app.py',
      './frontend-dist'
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
        setupExe: `FowCrawler-Windows-v${packageJson.version}-Setup.exe`,
        setupIcon: path.join(__dirname, 'assets', 'icon.ico'),
        noMsi: true,
        // Customize installer metadata for a more professional appearance
        title: 'FowCrawler',
        description: 'League of Legends Player Search Tool',
        owners: 'r-thinking',
        copyright: `Copyright © ${new Date().getFullYear()} r-thinking`,
        // Replace the emerald animation with a custom loading GIF
        // loadingGif: path.join(__dirname, 'assets', 'installer-loading.gif'),
        // NOTE: To use custom loading animation, create a GIF file and uncomment the line above
      },
    },
    // Alternative: Traditional Windows MSI installer (uncomment to use)
    // {
    //   name: '@electron-forge/maker-wix',
    //   config: {
    //     name: `FowCrawler-Windows-v${packageJson.version}`,
    //     manufacturer: 'r-thinking',
    //     description: 'League of Legends Player Search Tool',
    //     version: packageJson.version,
    //     ui: {
    //       chooseDirectory: true,
    //       images: {
    //         // Optional: Add custom branding images
    //         // background: path.join(__dirname, 'assets', 'installer-bg-493x312.bmp'),
    //         // banner: path.join(__dirname, 'assets', 'installer-banner-493x58.bmp')
    //       }
    //     }
    //   },
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
      config: (arch, platform) => ({
        name: platform === 'darwin' 
          ? `FowCrawler-macOS-v${packageJson.version}` 
          : `FowCrawler-Windows-v${packageJson.version}`
      })
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        // Minimal configuration to avoid hdiutil issues
        name: `FowCrawler-macOS-v${packageJson.version}`,
        overwrite: true,
        debug: true
      }
    },
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

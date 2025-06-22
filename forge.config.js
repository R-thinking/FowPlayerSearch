const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'FowCrawler',
    productName: 'FowCrawler',
    executableName: 'FowCrawler',
    icon: './assets/icon', // Will look for icon.ico on Windows, icon.icns on macOS
    appBundleId: 'com.rthinking.fowcrawler',
    extraResource: [
      './python_api',
      './requirements.txt'
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
        setupIcon: './assets/icon.ico',
        noMsi: true, // Set to false if you want MSI installer too
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
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

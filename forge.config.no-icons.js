const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

// Fallback configuration without icons for CI builds
module.exports = {
  packagerConfig: {
    asar: true,
    name: 'FowCrawler',
    productName: 'FowCrawler',
    executableName: 'FowCrawler',
    // No icon specified - will use default Electron icon
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
        // No setupIcon specified
        noMsi: true,
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
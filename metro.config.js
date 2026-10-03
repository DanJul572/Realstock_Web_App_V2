// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The web barcode scanner (ZXing) needs its WebAssembly file; bundle it as an
// asset so it is served from our own host instead of a CDN.
config.resolver.assetExts.push('wasm');

module.exports = config;

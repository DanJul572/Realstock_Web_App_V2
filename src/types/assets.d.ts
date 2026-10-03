// Metro bundles .wasm files as assets (see metro.config.js); importing one
// yields an asset module id for expo-asset.
declare module '*.wasm' {
  const assetId: number;
  export default assetId;
}

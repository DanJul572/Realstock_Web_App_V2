import { Asset } from 'expo-asset';
import zxingWasm from 'zxing-wasm/reader/zxing_reader.wasm';

let prepared: Promise<void> | null = null;

// Browsers without a native BarcodeDetector (Safari, Firefox, desktop Linux
// Chrome) fall back to ZXing compiled to WebAssembly, which by default is
// downloaded from a CDN. Point it at the copy bundled with the app instead so
// scanning works without access to the CDN. Must run before the first scan.
const prepareScanner = (): Promise<void> => {
  if (!prepared) {
    prepared = (async () => {
      if ('BarcodeDetector' in globalThis) {
        return;
      }
      const { setZXingModuleOverrides } = await import('barcode-detector');
      const wasm = Asset.fromModule(zxingWasm);
      setZXingModuleOverrides({
        locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasm.uri : prefix + path),
      });
    })();
  }
  return prepared;
};

export default prepareScanner;

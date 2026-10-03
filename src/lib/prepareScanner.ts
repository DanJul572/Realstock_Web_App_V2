// Native platforms scan with the OS barcode APIs; nothing to prepare.
const prepareScanner = (): Promise<void> => Promise.resolve();

export default prepareScanner;

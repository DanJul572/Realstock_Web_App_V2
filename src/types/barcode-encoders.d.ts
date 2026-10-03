// The encoder-only entry points used by src/lib/labels.ts ship without types.

declare module 'qrcode/lib/core/qrcode' {
  type QRCodeType = {
    modules: { data: Uint8Array; size: number };
  };
  export function create(
    text: string,
    options?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }
  ): QRCodeType;
}

declare module 'jsbarcode/bin/barcodes/CODE128' {
  export class CODE128 {
    constructor(data: string, options: object);
    valid(): boolean;
    encode(): { data: string; text: string };
  }
}

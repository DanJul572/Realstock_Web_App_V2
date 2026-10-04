import { printAsync } from 'expo-print';
import { CODE128 } from 'jsbarcode/bin/barcodes/CODE128';
import { create as createQrCode } from 'qrcode/lib/core/qrcode';
import { Platform } from 'react-native';

// Only the encoders of `qrcode` and `jsbarcode` are used (no DOM or Node APIs),
// so the same SVG markup works for the in-app preview (web + native) and for
// the printed labels.

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

// QR code as an SVG made of one path, with a 2-module quiet zone.
export const qrCodeSvg = (text: string): string => {
  const { modules } = createQrCode(text, { errorCorrectionLevel: 'M' });
  const quietZone = 2;
  const viewSize = modules.size + quietZone * 2;
  let path = '';
  for (let row = 0; row < modules.size; row++) {
    for (let column = 0; column < modules.size; column++) {
      if (modules.data[row * modules.size + column]) {
        path += `M${column + quietZone} ${row + quietZone}h1v1h-1z`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
};

// Code 128 barcode as an SVG; null when the text can't be encoded (non-ASCII).
export const code128Svg = (text: string): string | null => {
  const encoder = new CODE128(text, {});
  if (!encoder.valid()) {
    return null;
  }
  const bits = encoder.encode().data;
  const quietZone = 10;
  const height = 50;
  let path = '';
  bits.split('').forEach((bit, index) => {
    if (bit === '1') {
      path += `M${index + quietZone} 0h1v${height}h-1z`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bits.length + quietZone * 2} ${height}" preserveAspectRatio="none" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
};

export const svgDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export type LabelType = {
  code: string;
  subtitle: string;
  title: string;
};

// 60 x 40 mm stickers, laid out in a grid on A4 paper.
const labelsHtml = (label: LabelType, copies: number) => {
  const qr = qrCodeSvg(label.code);
  const barcode = code128Svg(label.code);
  const one = `
    <div class="label">
      <div class="qr">${qr}</div>
      <div class="info">
        <div class="title">${escapeXml(label.title)}</div>
        <div class="subtitle">${escapeXml(label.subtitle)}</div>
        ${barcode ? `<div class="barcode">${barcode}</div>` : ''}
        <div class="code">${escapeXml(label.code)}</div>
      </div>
    </div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeXml(label.code)}</title>
<style>
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
  .sheet { display: flex; flex-wrap: wrap; gap: 3mm; }
  .label { width: 60mm; height: 40mm; border: 0.3mm dashed #999; border-radius: 2mm; padding: 2.5mm;
           display: flex; gap: 2mm; align-items: center; page-break-inside: avoid; break-inside: avoid; }
  .qr { width: 24mm; height: 24mm; flex: none; }
  .qr svg, .barcode svg { width: 100%; height: 100%; display: block; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1mm; }
  .title { font-size: 9pt; font-weight: 700; line-height: 1.15; max-height: 2.3em; overflow: hidden; }
  .subtitle { font-size: 7pt; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .barcode { height: 9mm; }
  .code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.3mm; }
</style>
</head>
<body><div class="sheet">${Array.from({ length: copies }, () => one).join('')}</div></body>
</html>`;
};

// Web: print through a hidden iframe so only the labels are printed (expo-print
// ignores `html` on web). Native: expo-print renders the same HTML.
export const printLabels = async (label: LabelType, copies: number) => {
  const html = labelsHtml(label, copies);
  if (Platform.OS !== 'web') {
    await printAsync({ html });
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    border: '0',
    height: '0',
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
  });
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    iframe.srcdoc = html;
  });
  const printWindow = iframe.contentWindow;
  printWindow?.focus();
  printWindow?.print();
  // Remove after the print dialog closes (print() blocks until then in most
  // browsers; the timeout covers the ones where it doesn't).
  setTimeout(() => iframe.remove(), 60_000);
};

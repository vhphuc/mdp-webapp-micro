// 0664171_4752081_3894816_002-048-003_E4-E-1_6529_17972_1_1_1
export function extractUnitBarcode(qrCode: string): string {
  if (!qrCode.includes('_')) return qrCode;
  return qrCode.split('_')[0];
}

export function extractOrderId(qrCode: string): string {
  if (!qrCode.includes('_')) return qrCode;
  return qrCode.split('_')[1];
}

export function extractMugBarcode(fileName: string) {
  // 4-line layout
  // MUG_<job id>
  // <order item unit barcode>_
  // <size desc>-<color desc>
  // <job index>-<# files in job>
  return fileName.split('_')[1].slice(-7) ?? fileName;
}

export function extractDtfQrcode(qrCode: string) {
  return qrCode.startsWith('DTF') ? qrCode.split('_')[2].slice(-7) : qrCode;
}

/**
 * Barcode Group
 * 27783545
 * G0000010 3x4
 * 1-1 - Index 1-1
 * 27783545G0000010 3x41-1 - Index 1-1
 */
export function extractStickerStripQrCode(qrCode: string) {
  return qrCode.split(' ')[0].slice(-8) ?? qrCode;
}

// JIT_{Barcode}_{OrderId}_{Sku}_{batchTicketId}_{poId}_{RowNumber}/{Total}
export function extractJitItemBarcode(qrCode: string) {
  return qrCode.toUpperCase().startsWith('JIT') ? qrCode.split('_')[1] : qrCode;
}
export function extractJitItemOrderId(qrCode: string) {
  return qrCode.toUpperCase().startsWith('JIT') ? qrCode.split('_')[2] : qrCode;
}

export function extractHatBarcode(qrcode: string) {
  // 3-line layout
  // Line 1: D | T_HAT/BAG_<Job ID>_<Batch Index>-<Batch Total>
  // Line 2: <Barcode #>_
  // Line 3: <Garment Size Code>-<Garment Color Desc>
  return qrcode.split('_')[3].slice(-7) ?? qrcode;
}
export function isHatBarcode(qrCode: string) {
  return qrCode.toUpperCase().split('_')[1] === 'HAT' || qrCode.toUpperCase().split('_')[1] === 'BAG';
}

// Format Barcode_OrderId_yyyyMMddhhmm
// Example: 1CCC44A_30038169_202408010759
export function extractEmbroideryBarcode(code: string) {
  return code.toUpperCase().split('_')[0];
}

// HNGR-XXX
export function isHangerBarcode(code: string) {
  return code.toUpperCase().startsWith('HNGR');
}
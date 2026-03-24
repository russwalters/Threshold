import QRCode from 'qrcode'

const defaultOptions = {
  errorCorrectionLevel: 'M' as const,
  margin: 2,
  color: {
    dark: '#2D2926', // Hearth
    light: '#FAF7F2', // Linen
  },
}

/**
 * Generate a QR code as a PNG data URL.
 */
export async function generateQRCodeDataUrl(
  url: string,
  size: number = 256
): Promise<string> {
  return QRCode.toDataURL(url, {
    ...defaultOptions,
    width: size,
  })
}

/**
 * Generate a QR code as an SVG string.
 */
export async function generateQRCodeSvg(
  url: string,
  size: number = 256
): Promise<string> {
  return QRCode.toString(url, {
    ...defaultOptions,
    type: 'svg',
    width: size,
  })
}

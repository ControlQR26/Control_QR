import QRCode from 'qrcode';

export async function generateQRDataUrl(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#39a900', // Green
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR Code', error);
    throw new Error('Failed to generate QR Code');
  }
}

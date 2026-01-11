import { getNodeImageAdapter } from './adapter';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

describe('NodeImageAdapter', () => {
  describe('getImageSize', () => {
    it('should return correct dimensions for a PNG image', async () => {
      const adapter = await getNodeImageAdapter();

      // Read the test image from fixtures
      const imagePath = path.join(__dirname, '../fixtures/test-image.png');
      const imageBuffer = fs.readFileSync(imagePath);

      // Convert to data URL
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      // Get image size
      const size = await adapter.getImageSize(dataUrl);

      // Assert dimensions match the test image (100x50)
      expect(size.width).toBe(100);
      expect(size.height).toBe(50);
    });
  });

  describe('convertSvgToPng', () => {
    it('should convert an SVG to a PNG buffer', async () => {
      const adapter = await getNodeImageAdapter();

      // Create an SVG with a blue rectangle
      const svg = adapter.createSvg();
      svg.size(200, 150);
      svg.rect(200, 150).fill('#0000ff');

      // Convert to PNG
      const pngBuffer = await adapter.convertSvgToPng(svg);

      // Verify it's a valid PNG buffer
      expect(Buffer.isBuffer(pngBuffer)).toBe(true);

      // Verify the PNG has correct dimensions using sharp
      const metadata = await sharp(pngBuffer).metadata();
      expect(metadata.format).toBe('png');
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(150);
    });
  });

  describe('getImageData', () => {
    it('should resize an image and return raw pixel data', async () => {
      const adapter = await getNodeImageAdapter();

      // Read the test image from fixtures
      const imagePath = path.join(__dirname, '../fixtures/test-image.png');
      const imageBuffer = fs.readFileSync(imagePath);

      // Convert to data URL
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      // Get raw image data resized to 80x80
      const rawData = await adapter.getImageData(dataUrl, 80);

      // Read the reference image and convert to raw data
      const referencePath = path.join(__dirname, '../fixtures/test-image-small-square.png');
      const referenceBuffer = fs.readFileSync(referencePath);
      const referenceRawData = await sharp(referenceBuffer)
        .raw()
        .toBuffer();

      // Compare the raw data
      expect(Buffer.isBuffer(rawData)).toBe(true);
      expect(rawData.length).toBe(referenceRawData.length);
      expect((rawData as Buffer).toString('hex')).toBe(referenceRawData.toString('hex'));
    });
  });
});

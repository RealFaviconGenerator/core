import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringToSvg } from '@realfavicongenerator/generate-favicon';
import {
  transformSvg,
  initTransformation,
  IconTransformationType,
} from '@realfavicongenerator/generate-favicon/dist/icon/helper';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';
import { ImageAdapter } from '@realfavicongenerator/generate-favicon/dist/svg/adapter';

const SIZE = 1000;

// Written for humans: run the tests and open packages/generate-favicon/test-output/*.png
const OUTPUT_DIR = join(__dirname, '..', '..', 'test-output');

// A square master with a distinctly coloured marker near each corner and one in
// the centre. Because the viewBox side equals the render size, marker
// coordinates map 1:1 to output pixels, so we can sample them directly. When
// the physical-unit bug is present the artwork overflows and only the top-left
// corner survives, so the other markers read as background.
const MARKERS = {
  topLeft: { x: 70, y: 70, color: [255, 0, 0] },      // red
  topRight: { x: 930, y: 70, color: [0, 128, 0] },    // green
  bottomLeft: { x: 70, y: 930, color: [0, 0, 255] },  // blue
  bottomRight: { x: 930, y: 930, color: [255, 165, 0] }, // orange
  center: { x: 500, y: 500, color: [0, 0, 0] },       // black
};

const markerSvg = (width: string, height: string): string => {
  const circles = Object.values(MARKERS)
    .map(
      ({ x, y, color }) =>
        `<circle cx="${x}" cy="${y}" r="55" fill="rgb(${color.join(',')})"/>`,
    )
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="rgb(238,238,238)"/>${circles}</svg>`
  );
};

let adapter: ImageAdapter;

beforeAll(async () => {
  adapter = await getNodeImageAdapter();
  mkdirSync(OUTPUT_DIR, { recursive: true });
});

const renderToPng = async (svgString: string, fileName: string): Promise<Buffer> => {
  const svg = stringToSvg(svgString, adapter);
  const transformed = transformSvg(
    svg,
    initTransformation(IconTransformationType.None),
    adapter,
    SIZE,
  );
  const png = await adapter.convertSvgToPng(transformed);
  writeFileSync(join(OUTPUT_DIR, fileName), new Uint8Array(png));
  return png;
};

const samplePixels = async (png: Buffer) => {
  const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
  const raw = await adapter.getImageData(dataUrl, SIZE);
  const channels = raw.length / (SIZE * SIZE);
  return (x: number, y: number): [number, number, number] => {
    const i = (y * SIZE + x) * channels;
    return [raw[i], raw[i + 1], raw[i + 2]];
  };
};

const expectColorNear = (actual: [number, number, number], expected: number[]) => {
  for (let c = 0; c < 3; c++) {
    expect(Math.abs(actual[c] - expected[c])).toBeLessThanOrEqual(12);
  }
};

const expectAllMarkersPresent = async (png: Buffer) => {
  const at = await samplePixels(png);
  for (const [name, marker] of Object.entries(MARKERS)) {
    expectColorNear(at(marker.x, marker.y), marker.color);
  }
};

describe('icon rendering keeps the whole artwork', () => {
  it('renders every corner when the master uses physical units (mm)', async () => {
    // Reproduces the cropped-favicon bug: an Inkscape-style master sized in mm.
    // The width/height aspect matches the viewBox (as real exports do), so the
    // markers map 1:1 to output pixels.
    const png = await renderToPng(markerSvg('100mm', '100mm'), 'markers-mm.png');
    await expectAllMarkersPresent(png);
  });

  it('renders every corner when the master uses pixels (control)', async () => {
    const png = await renderToPng(markerSvg(`${SIZE}`, `${SIZE}`), 'markers-px.png');
    await expectAllMarkersPresent(png);
  });
});

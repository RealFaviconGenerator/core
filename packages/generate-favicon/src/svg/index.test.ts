import { stringToSvg, resolveLengthToPixels } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';
import { ImageAdapter } from '@realfavicongenerator/generate-favicon/dist/svg/adapter';
import { parse as parseHtml, HTMLElement } from 'node-html-parser';

let adapter: ImageAdapter;

beforeAll(async () => {
  adapter = await getNodeImageAdapter();
});

describe('stringToSvg', () => {
  it('should keep the structure of the input SVG', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.svg()).toEqual(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="red"></rect></svg>`);
  });

  it('should parse an SVG string with viewBox into an Svg object', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg).toBeDefined();
    expect(svg.width()).toBe(100);
    expect(svg.height()).toBe(100);
  });

  it('should preserve SVG children', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="10" fill="blue"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    const svgOutput = svg.svg();
    expect(svgOutput).toContain('circle');
    expect(svgOutput).toContain('fill="blue"');
  });

  it('should handle SVG with explicit width and height', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="green"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.width()).toBe(200);
    expect(svg.height()).toBe(150);
  });

  it('should strip DOCTYPE declarations', () => {
    const svgString = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg).toBeDefined();
    expect(svg.width()).toBe(100);
    expect(svg.height()).toBe(100);
  });

  it('should handle non-square viewBox', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><rect width="300" height="100" fill="yellow"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.width()).toBe(300);
    expect(svg.height()).toBe(100);
  });

  it('should convert physical units (mm) to pixels so the artwork is not cropped', () => {
    // SVGs exported by tools such as Inkscape carry physical units. Leaving the
    // unit in place made the downstream scaling math zoom into the top-left
    // corner. Width/height must be resolved to pixels at 96 DPI.
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="81.844mm" height="70.202mm" viewBox="0 0 820 702"><rect width="820" height="702" fill="red"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.width() as number).toBeCloseTo(81.844 * (96 / 25.4), 3);
    expect(svg.height() as number).toBeCloseTo(70.202 * (96 / 25.4), 3);
  });

  it('should resolve an explicit px unit to a plain number', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="200px" height="150px" viewBox="0 0 200 150"><rect width="200" height="150" fill="green"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.width()).toBe(200);
    expect(svg.height()).toBe(150);
  });

  it('should fall back to viewBox dimensions for unresolvable relative units', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 640 480"><rect width="640" height="480" fill="blue"/></svg>';

    const svg = stringToSvg(svgString, adapter);

    expect(svg.width()).toBe(640);
    expect(svg.height()).toBe(480);
  });
});

describe('resolveLengthToPixels', () => {
  it('returns numbers unchanged', () => {
    expect(resolveLengthToPixels(120)).toBe(120);
  });

  it('treats unitless and px strings as pixels', () => {
    expect(resolveLengthToPixels('120')).toBe(120);
    expect(resolveLengthToPixels('120px')).toBe(120);
  });

  it('converts physical units at 96 DPI', () => {
    expect(resolveLengthToPixels('1in')).toBeCloseTo(96, 6);
    expect(resolveLengthToPixels('2.54cm')).toBeCloseTo(96, 6);
    expect(resolveLengthToPixels('25.4mm')).toBeCloseTo(96, 6);
    expect(resolveLengthToPixels('72pt')).toBeCloseTo(96, 6);
    expect(resolveLengthToPixels('1pc')).toBeCloseTo(16, 6);
  });

  it('returns undefined for relative or unparseable values', () => {
    expect(resolveLengthToPixels('100%')).toBeUndefined();
    expect(resolveLengthToPixels('10em')).toBeUndefined();
    expect(resolveLengthToPixels('auto')).toBeUndefined();
  });
});

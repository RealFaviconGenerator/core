import { stringToSvg } from '@realfavicongenerator/generate-favicon';
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
});

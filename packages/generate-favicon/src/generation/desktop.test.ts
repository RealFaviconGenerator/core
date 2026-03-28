import { generateDesktopFaviconHtml, IcoFaviconFileName, PngFaviconFileName, PngFaviconFileSize, SvgFaviconFileName } from "./desktop";

test('generateDesktopFaviconHtml generates correct markups and CSS selectors', () => {
  const result = generateDesktopFaviconHtml('/favicon/');

  expect(result.markups).toEqual([
    `<link rel="icon" type="image/png" href="/favicon/${PngFaviconFileName}" sizes="${PngFaviconFileSize}x${PngFaviconFileSize}" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon/${SvgFaviconFileName}" />`,
    `<link rel="shortcut icon" href="/favicon/${IcoFaviconFileName}" />`,
  ]);
  expect(result.cssSelectors).toEqual([
    `link[rel="icon"][type="image/png"]`,
    `link[rel="icon"][type="image/svg\\+xml"]`,
    `link[rel="shortcut icon"]`,
  ]);
});

test('generateDesktopFaviconHtml appends version to all URLs', () => {
  const result = generateDesktopFaviconHtml('/favicon/', undefined, '2');

  expect(result.markups).toEqual([
    `<link rel="icon" type="image/png" href="/favicon/${PngFaviconFileName}?v=2" sizes="${PngFaviconFileSize}x${PngFaviconFileSize}" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon/${SvgFaviconFileName}?v=2" />`,
    `<link rel="shortcut icon" href="/favicon/${IcoFaviconFileName}?v=2" />`,
  ]);
});

test('generateDesktopFaviconHtml applies custom path transformer', () => {
  const transformer = (path: string) => `https://cdn.example.com${path}`;
  const result = generateDesktopFaviconHtml('/favicon/', transformer);

  expect(result.markups).toEqual([
    `<link rel="icon" type="image/png" href="https://cdn.example.com/favicon/${PngFaviconFileName}" sizes="${PngFaviconFileSize}x${PngFaviconFileSize}" />`,
    `<link rel="icon" type="image/svg+xml" href="https://cdn.example.com/favicon/${SvgFaviconFileName}" />`,
    `<link rel="shortcut icon" href="https://cdn.example.com/favicon/${IcoFaviconFileName}" />`,
  ]);
});

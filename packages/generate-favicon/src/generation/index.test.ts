import { normalizeFaviconPath } from ".";

test('normalizeFaviconPath', () => {
  expect(normalizeFaviconPath('/')).toEqual('/');
  expect(normalizeFaviconPath('')).toEqual('/');

  expect(normalizeFaviconPath('/my-favicon')).toEqual('/my-favicon/');
  expect(normalizeFaviconPath('/my-favicon/')).toEqual('/my-favicon/');
  expect(normalizeFaviconPath('my-favicon')).toEqual('/my-favicon/');

  expect(normalizeFaviconPath('/path/to/favicon')).toEqual('/path/to/favicon/');
  expect(normalizeFaviconPath('/path/to/favicon/')).toEqual('/path/to/favicon/');
  expect(normalizeFaviconPath('path/to/favicon')).toEqual('/path/to/favicon/');
})

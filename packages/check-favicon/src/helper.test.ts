import sharp from "sharp";
import { CheckIconProcessor, checkIcon, filePathToReadableStream, mergeUrlAndPath, parseSizesAttribute } from "./helper";
import { testFetcher } from "./test-helper";

const getTestProcessor = () => {
  const messages: string[] = [];

  const processor: CheckIconProcessor = {
    noHref: () => { messages.push('noHref') },
    icon404: () => { messages.push('icon404') },
    cannotGet: (httpStatusCode: number) => { messages.push(`cannotGet ${httpStatusCode}`) },
    downloadable: () => { messages.push('downloadable') },
    square: (widthHeight: number) => { messages.push(`square ${widthHeight}`) },
    notSquare: (width: number, Height: number) => { messages.push(`notSquare ${width}x${Height}`) },
    rightSize: (width: number) => { messages.push(`rightSize ${width}x${width}`) },
    wrongSize: (widthHeight: number) => { messages.push(`wrongSize ${widthHeight}x${widthHeight}`) }
  }

  return { processor, messages };
}

const testIcon = './fixtures/logo-transparent.png';
const nonSquareIcon = './fixtures/non-square.png';

test('checkIcon - noHref', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon(undefined, processor.processor, testFetcher({}), 'image/png')).toBeNull();
  expect(processor.messages).toEqual(['noHref']);
})

test('checkIcon - icon404', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/does-not-exist.png', processor.processor, testFetcher({}), 'image/png')).toBeNull();
  expect(processor.messages).toEqual(['icon404']);
})

test('checkIcon - icon404', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/bad-icon.png', processor.processor, testFetcher({
    '/bad-icon.png': {
      contentType: 'image/png',
      status: 500
    }
  }), 'image/png')).toBeNull();
  expect(processor.messages).toEqual(['cannotGet 500']);
})

test('checkIcon - downloadable & square', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/some-icon.png', processor.processor, testFetcher({
    '/some-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon)
    }
  }), 'image/png')).not.toBeNull();
  expect(processor.messages).toEqual([
    'downloadable',
    'square 754'
  ]);
})

test('checkIcon - downloadable & rightSize', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/some-icon.png', processor.processor, testFetcher({
    '/some-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon)
    }
  }), 'image/png', 754)).not.toBeNull();
  expect(processor.messages).toEqual([
    'downloadable',
    'square 754',
    'rightSize 754x754'
  ]);
})

test('checkIcon - downloadable & wrongSize', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/some-icon.png', processor.processor, testFetcher({
    '/some-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon)
    }
  }), 'image/png', 500)).not.toBeNull();
  expect(processor.messages).toEqual([
    'downloadable',
    'square 754',
    'wrongSize 754x754'
  ]);
})

test('checkIcon - downloadable & notSquare', async () => {
  const processor = getTestProcessor();
  expect(await checkIcon('/non-square-icon.png', processor.processor, testFetcher({
    '/non-square-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(nonSquareIcon)
    }
  }), 'image/png', 500)).toBeNull();
  expect(processor.messages).toEqual([
    'downloadable',
    'notSquare 240x180'
  ]);
})

test('mergeUrlAndPath', () => {
  expect(mergeUrlAndPath('https://example.com', '/some-path')).toBe('https://example.com/some-path');
  expect(mergeUrlAndPath('https://example.com', 'some/path')).toBe('https://example.com/some/path');

 expect(mergeUrlAndPath('https://example.com', 'some/path?some=param&and=other-param')).toBe('https://example.com/some/path?some=param&and=other-param');

  expect(mergeUrlAndPath('https://example.com/sub-page', '/some-path')).toBe('https://example.com/some-path');
  expect(mergeUrlAndPath('https://example.com/sub-page', 'some/path')).toBe('https://example.com/sub-page/some/path');

  expect(mergeUrlAndPath('https://example.com', 'https://elsewhere.com/some-path')).toBe('https://elsewhere.com/some-path');
})

test('parseSizesAttribute', () => {
  expect(parseSizesAttribute(null)).toEqual(null);
  expect(parseSizesAttribute('dummy')).toEqual(null);

  expect(parseSizesAttribute("16x16")).toEqual(16);
  expect(parseSizesAttribute("50x170")).toEqual(null);
})

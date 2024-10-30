import { parse } from 'node-html-parser'
import { checkPngFavicon, checkSvgFavicon } from "./desktop";
import { CheckerMessage, CheckerStatus, FetchResponse, MessageId } from '../types';
import { filePathToReadableStream, filePathToString, stringToReadableStream } from '../helper';
import { testFetcher } from '../test-helper';

type TestOutput = Pick<CheckerMessage, 'id' | 'status'>[];

const runSvgTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {}
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkSvgFavicon('https://example.com/', root, testFetcher(fetchDatabase));
  const filteredMessages = result.map(m => ({ status: m.status, id: m.id }));
  expect(filteredMessages).toEqual(output);
}

test('checkSvgFavicon - noHead', async () => {
  await runSvgTest(null, [{
    status: CheckerStatus.Error,
    id: MessageId.noHead,
  }]);
})

test('checkSvgFavicon - noSvgFavicon', async () => {
  await runSvgTest(`<title>SOme text</title>`, [{
    status: CheckerStatus.Error,
    id: MessageId.noSvgFavicon,
  }]);
})

test('checkSvgFavicon - multipleSvgFavicons', async () => {
  await runSvgTest(`
  <link rel="icon" type="image/svg+xml" href="/the-icon.svg" />
  <link rel="icon" type="image/svg+xml" href="/another-icon.svg" />
  `, [{
    status: CheckerStatus.Error,
    id: MessageId.multipleSvgFavicons,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & noSvgFaviconHref', async () => {
  await runSvgTest(`<link rel="icon" type="image/svg+xml" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.noSvgFaviconHref,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & svgFavicon404', async () => {
  await runSvgTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.svgFavicon404,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & svgFaviconCannotGet', async () => {
  await runSvgTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.svgFaviconCannotGet,
  }], {
    'https://example.com/the-icon.svg': {
      status: 403,
      contentType: 'image/svg+xml'
    }
  });
})

// For https://github.com/RealFaviconGenerator/core/issues/2
test('checkSvgFavicon - Protocol-relative URL', async () => {
  await runSvgTest(`<link rel="icon" type="image/svg+xml" href="//example.com/the-icon.svg" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.svgFaviconCannotGet,
  }], {
    'https://example.com/the-icon.svg': {
      status: 403,
      contentType: 'image/svg+xml'
    }
  });
})

test('checkSvgFavicon - svgFaviconDeclared & svgFaviconDownloadable & svgFaviconSquare', async () => {
  const testIconPath = './fixtures/happy-face.svg';

  const serpIcon = await filePathToString(testIconPath);

  await runSvgTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [
    {
      status: CheckerStatus.Ok,
      id: MessageId.svgFaviconDeclared,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.svgFaviconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.svgFaviconSquare,
    }], {
    'https://example.com/the-icon.svg': {
      status: 200,
      contentType: 'image/svg+xml',
      readableStream: await filePathToReadableStream(testIconPath)
    }
  });
})

const runPngTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {}
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkPngFavicon('https://example.com/', root, testFetcher(fetchDatabase));
  const filteredMessages = result.messages.map(m => ({ status: m.status, id: m.id }));
  expect(filteredMessages).toEqual(output);
}

const testIcon16 = './fixtures/16x16.png';
const testIcon32 = './fixtures/32x32.png';
const testIcon48 = './fixtures/48x48.png';
const testIcon96 = './fixtures/96x96.png';

test('checkSvgFavicon - Three PNG icons with different sizes', async () => {
  await runPngTest(`
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon/favicon-48x48.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
  `, [{
    status: CheckerStatus.Ok,
    id: MessageId.desktopPngFaviconDeclared,
  }, {
    status: CheckerStatus.Ok,
    id: MessageId.desktopPngFaviconDownloadable,
  }, {
    status: CheckerStatus.Ok,
    id: MessageId.desktopPngFaviconRightSize,
  }],
  {
    'https://example.com/favicon/favicon-16x16.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon16),
    },
    'https://example.com/favicon/favicon-32x32.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon32),
    },
    'https://example.com/favicon/favicon-48x48.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon48),
    },
    'https://example.com/favicon/favicon-96x96.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon96),
    }
  });
})

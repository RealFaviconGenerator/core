import { parse } from 'node-html-parser'
import { checkSvgFavicon } from "./desktop";
import { CheckerMessage, CheckerStatus, FetchResponse, MessageId } from '../types';
import { filePathToReadableStream, filePathToString, stringToReadableStream } from '../helper';
import { testFetcher } from '../test-helper';

type TestOutput = Pick<CheckerMessage, 'id' | 'status'>[];

const runTest = async (
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
  await runTest(null, [{
    status: CheckerStatus.Error,
    id: MessageId.noHead,
  }]);
})

test('checkSvgFavicon - noSvgFavicon', async () => {
  await runTest(`<title>SOme text</title>`, [{
    status: CheckerStatus.Error,
    id: MessageId.noSvgFavicon,
  }]);
})

test('checkSvgFavicon - multipleSvgFavicons', async () => {
  await runTest(`
  <link rel="icon" type="image/svg+xml" href="/the-icon.svg" />
  <link rel="icon" type="image/svg+xml" href="/another-icon.svg" />
  `, [{
    status: CheckerStatus.Error,
    id: MessageId.multipleSvgFavicons,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & noSvgFaviconHref', async () => {
  await runTest(`<link rel="icon" type="image/svg+xml" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.noSvgFaviconHref,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & svgFavicon404', async () => {
  await runTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [{
    status: CheckerStatus.Ok,
    id: MessageId.svgFaviconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.svgFavicon404,
  }]);
})

test('checkSvgFavicon - svgFaviconDeclared & svgFaviconCannotGet', async () => {
  await runTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [{
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

  await runTest(`<link rel="icon" type="image/svg+xml" href="/the-icon.svg" />`, [
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

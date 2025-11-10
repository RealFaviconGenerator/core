import parse from "node-html-parser";
import { CheckerMessage, CheckerStatus, FetchResponse, MessageId, WebAppManifestReport } from "./types";
import { checkWebAppManifest, checkWebAppManifestFile } from "./web-app-manifest";
import { testFetcher } from "./test-helper";
import { bufferToDataUrl, filePathToReadableStream, readableStreamToBuffer } from "./helper";

type TestOutput = {
  messages: Pick<CheckerMessage, 'id' | 'status'>[],
  name?: string,
  shortName?: string,
  backgroundColor?: string,
  themeColor?: string,
  icon?: string | null
}

const filterOutput = (report: WebAppManifestReport): any => ({
  ...report,
  messages: report.messages.map(m => ({ status: m.status, id: m.id }))
})

const runCheckTouchIconTitleTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {}
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkWebAppManifest('https://example.com/', root, testFetcher(fetchDatabase));
  expect(filterOutput(result)).toEqual({
    name: undefined,
    shortName: undefined,
    backgroundColor: undefined,
    themeColor: undefined,
    icon: null,
    ...output,
  });
}

test('checkWebAppManifest - noHead', async () => {
  await runCheckTouchIconTitleTest(null, { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noHead,
  }]});
})

test('checkWebAppManifest - noManifest', async () => {
  await runCheckTouchIconTitleTest('<title>Hey</title>', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noManifest,
  }]});
})

test('checkWebAppManifest - noManifestHref', async () => {
  await runCheckTouchIconTitleTest('<link rel="manifest" />', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noManifestHref,
  }]});
})

test('checkWebAppManifest - manifest404', async () => {
  await runCheckTouchIconTitleTest('<link rel="manifest" href="not-found.json" />', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.manifest404,
  }]});
})

test('checkWebAppManifest - manifestCannotGet', async () => {
  await runCheckTouchIconTitleTest('<link rel="manifest" href="/error.json" />', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.manifestCannotGet,
  }]}, {
    'https://example.com/error.json': {
      status: 500,
      contentType: 'application/json',
      readableStream: null
    }
  });
})

test('checkWebAppManifest - manifestInvalidJson', async () => {
  await runCheckTouchIconTitleTest('<link rel="manifest" href="/bad-manifest.json" />', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.manifestInvalidJson,
  }]}, {
    'https://example.com/bad-manifest.json': {
      status: 200,
      contentType: 'application/json',
      readableStream: stringToReadableStream('{ bad JSON }')
    }
  });
})

const stringToReadableStream = (str: string) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str));
      controller.close();
    }
  });
  return stream;
}

test('checkWebAppManifestFile - Missing fields', async () => {
  const report = await checkWebAppManifestFile({
    name: null,
    short_name: null,
    background_color: null,
    theme_color: null,
    icons: []
  }, 'https://example.com/', testFetcher({}));

  expect(filterOutput(report)).toEqual({
    messages: [{
      status: CheckerStatus.Error,
      id: MessageId.noManifestName,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.noManifestShortName,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.noManifestBackgroundColor,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.noManifestThemeColor,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.noManifestIcons,
    }],
    name: undefined,
    shortName: undefined,
    backgroundColor: undefined,
    themeColor: undefined,
    icon: null
  });
})

const testIcon192 = './fixtures/192x192.png';
const testIcon512 = './fixtures/512x512.png';

test('checkWebAppManifestFile - Everything is fine', async () => {
  const report = await checkWebAppManifestFile({
    name: 'My long name',
    short_name: 'Short!',
    background_color: '#123456',
    theme_color: '#abcdef',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }, 'https://example.com/', testFetcher({
    'https://example.com/icon-192.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon192)
    },
    'https://example.com/icon-512.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon512)
    }
  }));

  const expectedIconReport = [
    {
      status: CheckerStatus.Ok,
      id: MessageId.manifestIconDeclared,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.manifestIconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.manifestIconRightSize,
    }
  ];

  expect(filterOutput(report)).toEqual({
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.manifestName,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.manifestShortName,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.manifestBackgroundColor,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.manifestThemeColor,
    },
    ...expectedIconReport, ...expectedIconReport], // Two icons
    name: 'My long name',
    shortName: 'Short!',
    backgroundColor: '#123456',
    themeColor: '#abcdef',
    icon: {
      content: bufferToDataUrl(await readableStreamToBuffer(await filePathToReadableStream(testIcon512)), 'image/png'),
      url: "https://example.com/icon-512.png",
      width: 512,
      height: 512,
    },
  });
})

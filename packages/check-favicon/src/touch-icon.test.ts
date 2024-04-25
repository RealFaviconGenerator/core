import { parse } from 'node-html-parser'
import { CheckerMessage, CheckerStatus, FetchResponse, MessageId } from "./types";
import { checkTouchIcon, checkTouchIconIcon, checkTouchIconTitle, getDuplicatedSizes } from "./touch-icon";
import { testFetcher } from './test-helper';
import { bufferToDataUrl, filePathToReadableStream, readableStreamToBuffer } from './helper';

type TestOutput = {
  messages: Pick<CheckerMessage, 'id' | 'status'>[],
  appTitle?: string,
  touchIcon?: string | null
}

const runCheckTouchIconTitleTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {}
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkTouchIconTitle('https://example.com/', root, testFetcher(fetchDatabase));
  const filteredMessages = result.messages.map(m => ({ status: m.status, id: m.id }));
  expect({
    messages: filteredMessages,
    appTitle: result.appTitle
  }).toEqual(output);
}

test('checkTouchIconTitle - noHead', async () => {
  await runCheckTouchIconTitleTest(null, { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noHead,
  }]});
})

test('checkTouchIconTitle - noTouchWebAppTitle', async () => {
  await runCheckTouchIconTitleTest('<title>Some text</title>', { messages: [{
    status: CheckerStatus.Warning,
    id: MessageId.noTouchWebAppTitle,
  }]});
})

test('checkTouchIconTitle - multipleTouchWebAppTitles', async () => {
  await runCheckTouchIconTitleTest(`
    <meta name="apple-mobile-web-app-title" content="First title">
    <meta name="apple-mobile-web-app-title" content="Second title">
  `, { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.multipleTouchWebAppTitles,
  }]});
})

test('checkTouchIconTitle - touchWebAppTitleDeclared', async () => {
  await runCheckTouchIconTitleTest(`
    <meta name="apple-mobile-web-app-title" content="The App Name">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchWebAppTitleDeclared,
  }], appTitle: 'The App Name' });
})

const runCheckTouchIconTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {}
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkTouchIconIcon('https://example.com/', root, testFetcher(fetchDatabase));
  const filteredMessages = result.messages.map(m => ({ status: m.status, id: m.id }));
  expect({
    messages: filteredMessages,
    touchIcon: result.touchIcon
  }).toEqual({
    ...output,
    touchIcon: output.touchIcon || null
  });
}

test('checkTouchIcon - noHead', async () => {
  await runCheckTouchIconTest(null, { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noHead,
  }]});
})

test('checkTouchIcon - noTouchIcon', async () => {
  await runCheckTouchIconTest('<title>Some text</title>', { messages: [{
    status: CheckerStatus.Error,
    id: MessageId.noTouchIcon,
  }]});
})

test('checkTouchIcon - touchIconWithSize', async () => {
  await runCheckTouchIconTest(`
    <link rel="apple-touch-icon" sizes="152x152" href="some-other-icon.png">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
  }, {
    status: CheckerStatus.Warning,
    id: MessageId.touchIconWithSize,
  }]}, {
    'https://example.com/some-other-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    }
  });
})

test('checkTouchIcon - multipleTouchIcon - no size', async () => {
  await runCheckTouchIconTest(`
    <link rel="apple-touch-icon" href="some-icon.png">
    <link rel="apple-touch-icon" href="some-other-icon.png">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.duplicatedTouchIconSizes,
  }]}, {
    'https://example.com/some-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    },
    'https://example.com/some-other-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    }
  });
})

test('checkTouchIcon - multipleTouchIcon - specific size', async () => {
  await runCheckTouchIconTest(`
    <link rel="apple-touch-icon" sizes="180x180" href="some-icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="some-other-icon.png">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
  }, {
    status: CheckerStatus.Warning,
    id: MessageId.touchIconWithSize,
  }, {
    status: CheckerStatus.Error,
    id: MessageId.duplicatedTouchIconSizes,
  }]}, {
    'https://example.com/some-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    },
    'https://example.com/some-other-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    }
  });
})

test('checkTouchIcon - touchIconWithSize', async () => {
  await runCheckTouchIconTest(`
    <link rel="apple-touch-icon" sizes="180x180" href="some-other-icon.png">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
  }, {
    status: CheckerStatus.Warning,
    id: MessageId.touchIconWithSize,
  }]}, {
    'https://example.com/some-other-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: null
    }
  });
})

const testIcon = './fixtures/180x180.png';

test('checkTouchIcon - Regular case', async () => {
  await runCheckTouchIconTest(`
    <link rel="apple-touch-icon" href="some-other-icon.png">
  `, { messages: [{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
  }, {
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDownloadable,
  },{
    status: CheckerStatus.Ok,
    id: MessageId.touchIconSquare
  }], touchIcon: bufferToDataUrl(await readableStreamToBuffer(await filePathToReadableStream(testIcon)), 'image/png')
  }, {
    'https://example.com/some-other-icon.png': {
      status: 200,
      contentType: 'image/png',
      readableStream: await filePathToReadableStream(testIcon)
    }
  });
})



test('getDuplicatedSizes', () => {
  // No duplicates
  expect(getDuplicatedSizes([])).toEqual([]);
  expect(getDuplicatedSizes([ undefined ])).toEqual([]);
  expect(getDuplicatedSizes([ '180x180' ])).toEqual([]);
  expect(getDuplicatedSizes([ undefined, '180x180' ])).toEqual([]);

  // Duplicates
  expect(getDuplicatedSizes([ '152x152', '180x180', '180x180' ])).toEqual([ '180x180' ]);
  expect(getDuplicatedSizes([ undefined, '180x180', undefined, undefined ])).toEqual([ undefined ]);
  expect(getDuplicatedSizes([
    '152x152', '180x180', '152x152', undefined, '152x152', undefined
  ])).toEqual([
    '152x152', undefined
  ]);
})

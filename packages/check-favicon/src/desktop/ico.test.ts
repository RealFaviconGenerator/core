import { parse } from 'node-html-parser'
import { checkIcoFavicon } from "./ico";
import { CheckerMessage, CheckerStatus, DesktopSingleReport, FetchResponse, MessageId } from '../types';
import { filePathToReadableStream } from '../helper';
import { testFetcher } from '../test-helper';

type TestOutput = {
  messages: Pick<CheckerMessage, 'id' | 'status'>[];
  icon: DesktopSingleReport['icon'];
}

const runIcoTest = async (
  headFragment: string | null,
  output: TestOutput,
  fetchDatabase: { [url: string]: FetchResponse } = {},
  checkContent = true
) => {
  const root = headFragment ? parse(headFragment) : null;
  const result = await checkIcoFavicon('https://example.com/', root, testFetcher(fetchDatabase));
  const filteredMessages = result.messages.map(m => ({ status: m.status, id: m.id }));
  expect(filteredMessages).toEqual(output.messages);

  // Check icon properties - icon is always returned by checkIcoFavicon
  const resultIcon = result.icon!;
  const outputIcon = output.icon!;

  expect(resultIcon.url).toEqual(outputIcon.url);
  expect(resultIcon.width).toEqual(outputIcon.width);
  expect(resultIcon.height).toEqual(outputIcon.height);

  // For content, just check if it's null or not null unless exact match is needed
  if (checkContent && outputIcon.content === null) {
    expect(resultIcon.content).toBeNull();
  } else if (checkContent && outputIcon.content !== null) {
    expect(resultIcon.content).not.toBeNull();
    expect(resultIcon.content).toMatch(/^data:image\/(png|bmp);base64,/);
  }
}

test('checkIcoFavicon - noHead', async () => {
  await runIcoTest(null, {
    messages: [{
      status: CheckerStatus.Error,
      id: MessageId.noHead,
    }],
    icon: {
      content: null,
      url: null,
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - noIcoFavicon', async () => {
  await runIcoTest(`<title>Some text</title>`, {
    messages: [{
      status: CheckerStatus.Error,
      id: MessageId.noIcoFavicon,
    }],
    icon: {
      content: null,
      url: null,
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - implicit /favicon.ico when not declared', async () => {
  const testIconPath = './fixtures/simple-ico.ico';

  await runIcoTest(`<title>Some text</title>`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconImplicitInRoot,
    },{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconExpectedSizes,
    }],
    icon: {
      content: "data:image/png;base64,placeholder", // Will be checked for format only
      url: 'https://example.com/favicon.ico',
      width: 48,
      height: 48,
    }
  }, {
    'https://example.com/favicon.ico': {
      status: 200,
      contentType: 'image/x-icon',
      readableStream: await filePathToReadableStream(testIconPath)
    }
  });
})

test('checkIcoFavicon - multipleIcoFavicons with shortcut icon', async () => {
  await runIcoTest(`
  <link rel="shortcut icon" href="/favicon1.ico" />
  <link rel="shortcut icon" href="/favicon2.ico" />
  `, {
    messages: [{
      status: CheckerStatus.Error,
      id: MessageId.multipleIcoFavicons,
    }],
    icon: {
      content: null,
      url: null,
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - multipleIcoFavicons with type="image/x-icon"', async () => {
  await runIcoTest(`
  <link rel="icon" type="image/x-icon" href="/favicon1.ico" />
  <link rel="icon" type="image/x-icon" href="/favicon2.ico" />
  `, {
    messages: [{
      status: CheckerStatus.Error,
      id: MessageId.multipleIcoFavicons,
    }],
    icon: {
      content: null,
      url: null,
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - icoFaviconDeclared & noIcoFaviconHref', async () => {
  await runIcoTest(`<link rel="shortcut icon" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.noIcoFaviconHref,
    }],
    icon: {
      content: null,
      url: null,
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - icoFaviconDeclared & icoFavicon404', async () => {
  await runIcoTest(`<link rel="shortcut icon" href="/favicon.ico" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.icoFavicon404,
    }],
    icon: {
      content: null,
      url: 'https://example.com/favicon.ico',
      width: null,
      height: null,
    }
  });
})

test('checkIcoFavicon - icoFaviconDeclared & icoFaviconCannotGet', async () => {
  await runIcoTest(`<link rel="shortcut icon" href="/favicon.ico" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Error,
      id: MessageId.icoFaviconCannotGet,
    }],
    icon: {
      content: null,
      url: 'https://example.com/favicon.ico',
      width: null,
      height: null,
    }
  }, {
    'https://example.com/favicon.ico': {
      status: 403,
      contentType: 'image/x-icon'
    }
  });
})

test('checkIcoFavicon - icoFaviconDeclared & icoFaviconDownloadable & icoFaviconExpectedSizes', async () => {
  const testIconPath = './fixtures/simple-ico.ico';

  await runIcoTest(`<link rel="shortcut icon" href="/favicon.ico" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconExpectedSizes,
    }],
    icon: {
      content: "data:image/png;base64,placeholder", // Will be checked for format only
      url: 'https://example.com/favicon.ico',
      width: 48,
      height: 48,
    }
  }, {
    'https://example.com/favicon.ico': {
      status: 200,
      contentType: 'image/x-icon',
      readableStream: await filePathToReadableStream(testIconPath)
    }
  });
})

test('checkIcoFavicon - using type="image/x-icon"', async () => {
  const testIconPath = './fixtures/simple-ico.ico';

  await runIcoTest(`<link rel="icon" type="image/x-icon" href="/favicon.ico" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconExpectedSizes,
    }],
    icon: {
      content: "data:image/png;base64,placeholder", // Will be checked for format only
      url: 'https://example.com/favicon.ico',
      width: 48,
      height: 48,
    }
  }, {
    'https://example.com/favicon.ico': {
      status: 200,
      contentType: 'image/x-icon',
      readableStream: await filePathToReadableStream(testIconPath)
    }
  });
})

// For https://github.com/RealFaviconGenerator/core/issues/2
test('checkIcoFavicon - Protocol-relative URL', async () => {
  const testIconPath = './fixtures/simple-ico.ico';

  await runIcoTest(`<link rel="shortcut icon" href="//example.com/favicon.ico" />`, {
    messages: [{
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDownloadable,
    }, {
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconExpectedSizes,
    }],
    icon: {
      content: "data:image/png;base64,placeholder", // Will be checked for format only
      url: 'https://example.com/favicon.ico',
      width: 48,
      height: 48,
    }
  }, {
    'https://example.com/favicon.ico': {
      status: 200,
      contentType: 'image/x-icon',
      readableStream: await filePathToReadableStream(testIconPath)
    }
  });
})

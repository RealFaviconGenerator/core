import { checkRobotsFile, getRobotsFileUrl } from "./google";
import { stringToReadableStream } from "./helper";
import { testFetcher } from "./test-helper";
import { CheckerMessage, CheckerStatus, DesktopFaviconReport, MessageId } from "./types";

test('getRobotsFileUrl', () => {
  expect(getRobotsFileUrl('https://example.com')).toEqual('https://example.com/robots.txt');
  expect(getRobotsFileUrl('https://example.com/some-path')).toEqual('https://example.com/robots.txt');
});

const runRobotsTest = async (urls: string[], robotsFile: string | null, messages: Pick<CheckerMessage, 'id' | 'status'>[]) => {
  const report = await checkRobotsFile(
    'https://example.com',
    urls,
    testFetcher(robotsFile ? {
      'https://example.com/robots.txt': {
        status: 200,
        contentType: 'text/plain',
        readableStream: await stringToReadableStream(robotsFile)
      }
    } : {})
  );

  const filteredMessages = report.map(m => ({ status: m.status, id: m.id }));
  expect(filteredMessages).toEqual(messages);
}

test('checkRobotsFile - No robots file', async () => {
  await runRobotsTest(
    [ 'https://example.com/favicon.png' ],
    null,
    [
      {
        status: CheckerStatus.Ok,
        id: MessageId.googleNoRobotsFile
      }
    ]
  );
});

test('checkRobotsFile - PNG favicon is accessible', async () => {
  await runRobotsTest(
    [ 'https://example.com/favicon.png' ],
    `
User-agent: *
Allow: /`,
    [
      {
        status: CheckerStatus.Ok,
        id: MessageId.googleRobotsFileFound
      },
      {
        status: CheckerStatus.Ok,
        id: MessageId.googlePngIconAllowedByRobots
      }
    ]
  );
});

test('checkRobotsFile - PNG favicon is *not* accessible', async () => {
  await runRobotsTest(
    [ 'https://example.com/favicon.png' ],
    `
# *
User-agent: *
Allow: /

User-agent: Googlebot-Image
Disallow: /*.png
`,
    [
      {
        status: CheckerStatus.Ok,
        id: MessageId.googleRobotsFileFound
      },
      {
        status: CheckerStatus.Error,
        id: MessageId.googlePngIconBlockedByRobots
      }
    ]
  );
});

import robotsParser from "robots-parser";
import { checkDesktopFavicon } from "./desktop/desktop";
import { fetchFetcher, readableStreamToBuffer, readableStreamToString } from "./helper";
import { CheckedIcon, CheckerMessage, CheckerStatus, DesktopFaviconReport, Fetcher, GoogleReport, MessageId } from "./types";
import { HTMLElement } from "node-html-parser";

export const GoogleBot = 'Googlebot';
export const GoogleImageBot = 'Googlebot-Image';

export const getRobotsFileUrl = (baseUrl: string): string => {
  try {
    const url = new URL(baseUrl);
    url.pathname = '/robots.txt';
    return url.toString();
  } catch (error) {
    throw new Error(`Invalid URL ${baseUrl}`);
  }
}

export const checkRobotsFile = async (baseUrl: string, iconUrls: string[], fetcher: Fetcher = fetchFetcher): Promise<CheckerMessage[]> => {
  const robotsUrl = getRobotsFileUrl(baseUrl);
  const robotsResponse = await fetcher(robotsUrl);

  const messages: CheckerMessage[] = [];

  if (robotsResponse.status === 200) {
    messages.push({
      status: CheckerStatus.Ok,
      text: `robots.txt file found at ${robotsUrl}`,
      id: MessageId.googleRobotsFileFound
    });

    const robotsFile = robotsResponse.readableStream ? await readableStreamToString(robotsResponse.readableStream) : '';

    const robots = robotsParser(robotsUrl, robotsFile);

    iconUrls.forEach(url => {
      if (url) {
        if (robots.isAllowed(url, GoogleImageBot)) {
          messages.push({
            status: CheckerStatus.Ok,
            text: `Access to \`${url}\` is allowed for \`${GoogleImageBot}\``,
            id: MessageId.googlePngIconAllowedByRobots
          });
        } else {
          const line = robots.getMatchingLineNumber(url, GoogleImageBot);
          messages.push({
            status: CheckerStatus.Error,
            text: `Access to \`${url}\` is blocked for \`${GoogleImageBot}\` (\`${robotsUrl}\`, line ${line})`,
            id: MessageId.googlePngIconBlockedByRobots
          });
        }
      }
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      text: `No \`robots.txt\` file found at \`${robotsUrl}\`. Also this is not a recommanded setup, at least Google is not restricted from accessing favicon assets.`,
      id: MessageId.googleNoRobotsFile
    });
  }

  return messages;
}

export const checkGoogleFaviconFromDesktopReport = async (baseUrl: string, desktopReport: DesktopFaviconReport, fetcher: Fetcher = fetchFetcher): Promise<GoogleReport> => {
  const allIcons: CheckedIcon[] = [
    desktopReport.icons.png,
    desktopReport.icons.ico,
    desktopReport.icons.svg
  ].filter((i): i is CheckedIcon => !!i);

  const allIconUrls: string[] = allIcons.map(i => i.url).filter((i): i is string => !!i);

  const robotsMessages = await checkRobotsFile(baseUrl, allIconUrls, fetcher);

  const messages: CheckerMessage[] = [ ...desktopReport.messages, ...robotsMessages ];

  let finalIcon: string | null = null;
  let icons: CheckedIcon[] = [];
  let maxWidth = 0;

  allIcons.forEach(icon => {
    if (icon.content && icon.width && icon.height && icon.url) {
      icons.push(icon);
      if (icon.width > maxWidth) {
        finalIcon = icon.content;
        maxWidth = icon.width;
      }
    }
  });

  return {
    messages,
    icon: finalIcon,
    icons
  }
}

export const checkGoogleFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<GoogleReport> => {
  const desktopReport = await checkDesktopFavicon(baseUrl, head, fetcher);
  return checkGoogleFaviconFromDesktopReport(baseUrl, desktopReport, fetcher);
}

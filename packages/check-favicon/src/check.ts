import { checkDesktopFavicon } from "./desktop/desktop";
import { fetchFetcher } from "./helper";
import { checkTouchIcon } from "./touch-icon";
import { FaviconReport, Fetcher } from "./types";
import { HTMLElement } from 'node-html-parser'
import { checkWebAppManifest } from "./web-app-manifest";

export const extractPageTitle = (head: HTMLElement | null): string | undefined => {
  if (!head) {
    return undefined;
  }

  const titleElement = head.querySelector('title');
  const title = titleElement?.text?.trim();
  return title || undefined;
}

export const checkFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<FaviconReport> => {
  const desktop = await checkDesktopFavicon(baseUrl, head, fetcher);
  const touchIcon = await checkTouchIcon(baseUrl, head, fetcher);
  const webAppManifest = await checkWebAppManifest(baseUrl, head, fetcher);
  const pageTitle = extractPageTitle(head);

  return {
    pageTitle,
    desktop,
    touchIcon,
    webAppManifest
  }
}

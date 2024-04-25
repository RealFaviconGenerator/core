import { checkDesktopFavicon } from "./desktop/desktop";
import { fetchFetcher } from "./helper";
import { checkTouchIcon } from "./touch-icon";
import { FaviconReport, Fetcher } from "./types";
import { HTMLElement } from 'node-html-parser'
import { checkWebAppManifest } from "./web-app-manifest";

export const checkFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<FaviconReport> => {
  const desktop = await checkDesktopFavicon(baseUrl, head, fetcher);
  const touchIcon = await checkTouchIcon(baseUrl, head, fetcher);
  const webAppManifest = await checkWebAppManifest(baseUrl, head, fetcher);

  return {
    desktop,
    touchIcon,
    webAppManifest
  }
}

import { CheckerMessage, CheckerStatus, DesktopFaviconReport, Fetcher, MessageId } from "../types";
import { HTMLElement } from 'node-html-parser'
import sharp from 'sharp'
import { CheckIconProcessor, checkIcon, fetchFetcher, mergeUrlAndPath, readableStreamToString } from "../helper";
import { checkIcoFavicon } from "./ico";

export const PngFaviconFileSize = 96;

export const checkSvgFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<CheckerMessage[]> => {
  const messages: CheckerMessage[] = [];

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return messages;
  }

  const svgs = head?.querySelectorAll("link[rel='icon'][type='image/svg+xml']");
  if (svgs.length === 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noSvgFavicon,
      text: 'There is no SVG favicon'
    });
  } else if (svgs.length > 1) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.multipleSvgFavicons,
      text: `There are ${svgs.length} SVG favicons`
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.svgFaviconDeclared,
      text: 'The SVG favicon is declared'
    });

    const href = svgs[0].attributes.href;
    if (!href) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.noSvgFaviconHref,
        text: 'The SVG markup has no href attribute'
      });
    } else {
      const iconMessages = await checkSvgFaviconFile(baseUrl, href, fetcher)
      return [ ...messages, ...iconMessages ];
    }
  }

  return messages;
}

export const checkSvgFaviconFile = async (baseUrl: string, url: string, fetcher: Fetcher): Promise<CheckerMessage[]> => {
  const messages: CheckerMessage[] = [];

  const svgUrl = mergeUrlAndPath(baseUrl, url);

  const res = await fetcher(svgUrl, 'image/svg+xml');
  if (res.status === 404) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.svgFavicon404,
      text: `The SVG icon file \`${url}\` does not exist (404 error)`
    });
  } else if (res.status >= 300) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.svgFaviconCannotGet,
      text: `Cannot get the SVG icon file at \`${url}\` (${res.status} error)`
    });
  } else if (res.readableStream) {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.svgFaviconDownloadable,
      text: `The SVG favicon is accessible at \`${url}\``
    });

    const content = await readableStreamToString(res.readableStream);
    const meta = await sharp(Buffer.from(content)).metadata();

    if (meta.width !== meta.height) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.svgFaviconNotSquare,
        text: `The SVG is not square (${meta.width}x${meta.height})`
      });
    } else {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.svgFaviconSquare,
        text: `The SVG is square (${meta.width}x${meta.height})`
      });
    }
  }

  return messages;
}

export const checkPngFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<DesktopFaviconReport> => {
  const messages: CheckerMessage[] = [];

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return { messages, icon: null };
  }

  const icons = head?.querySelectorAll("link[rel='icon'][type='image/png']");
  if (icons.length === 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noDesktopPngFavicon,
      text: 'There is no desktop PNG favicon'
    });
  } else {
    const size = `${PngFaviconFileSize}x${PngFaviconFileSize}`;
    const sizedIconMarkup = icons.filter(icon => icon.attributes.sizes === size);

    if (sizedIconMarkup.length === 0) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.no96x96DesktopPngFavicon,
        text: `There is no ${size} desktop PNG favicon`
      });
    } else {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.desktopPngFaviconDeclared,
        text: `The ${size} desktop PNG favicon is declared`
      });

      const href = sizedIconMarkup[0].attributes.href;
      if (!href) {
        messages.push({
          status: CheckerStatus.Error,
          id: MessageId.noDesktopPngFaviconHref,
          text: `The ${size} desktop favicon markup has no href attribute`
        });
      } else {
        const iconUrl = mergeUrlAndPath(baseUrl, href);
        const processor: CheckIconProcessor = {
          cannotGet: (httpStatus) => {
            messages.push({
              status: CheckerStatus.Error,
              id: MessageId.desktopPngFaviconCannotGet,
              text: `Cannot get the ${size} desktop PNG favicon at \`${iconUrl}\` (${httpStatus} error)`
            });
          },
          downloadable: () => {
            messages.push({
              status: CheckerStatus.Ok,
              id: MessageId.desktopPngFaviconDownloadable,
              text: `The ${size} desktop PNG favicon is accessible`
            });
          },
          icon404: () => {
            messages.push({
              status: CheckerStatus.Error,
              id: MessageId.desktopPngFavicon404,
              text: `The ${size} desktop PNG favicon does not exist (404 error)`
            });
          },
          notSquare: (width, height) => {}, // Ignore this message
          wrongSize: (widthHeight) => {
            messages.push({
              status: CheckerStatus.Error,
              id: MessageId.desktopPngFaviconWrongSize,
              text: `The ${size} desktop PNG favicon has the wrong size (${widthHeight}x${widthHeight})`
            });
          },
          rightSize(widthHeight) {
            messages.push({
              status: CheckerStatus.Ok,
              id: MessageId.desktopPngFaviconRightSize,
              text: `The ${size} desktop PNG favicon has the right size`
            });
          },
          square: (widthHeight) => {}, // Ignore this message,
          noHref: () => {} // Ignore this message
        };
        const icon = await checkIcon(iconUrl, processor, fetcher, icons[0].attributes.mimeType || 'image/png', PngFaviconFileSize);
        return { messages, icon }
      }
    }
  }

  return { messages, icon: null };
}

export const checkDesktopFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<DesktopFaviconReport> => {
  const svgMessages = await checkSvgFavicon(baseUrl, head, fetcher);
  const pngReport = await checkPngFavicon(baseUrl, head, fetcher);
  const icoReport = await checkIcoFavicon(baseUrl, head, fetcher);
  return {
    messages: [ ...svgMessages, ...pngReport.messages, ...icoReport ],
    icon: pngReport.icon
  };
}

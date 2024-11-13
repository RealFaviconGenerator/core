import { CheckerMessage, CheckerStatus, DesktopFaviconReport, DesktopSingleReport, Fetcher, MessageId } from "../types";
import { HTMLElement } from 'node-html-parser'
import sharp from 'sharp'
import { CheckIconProcessor, bufferToDataUrl, checkIcon, fetchFetcher, mergeUrlAndPath, readableStreamToString } from "../helper";
import { checkIcoFavicon } from "./ico";

export const PngFaviconFileSize = 96;

export const checkSvgFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<DesktopSingleReport> => {
  const messages: CheckerMessage[] = [];

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return {
      messages,
      icon: { content: null, url: null, width: null, height: null }
    };
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
      const iconReport = await checkSvgFaviconFile(baseUrl, href, fetcher)
      return {
        messages: [ ...messages, ...iconReport.messages ],
        icon: iconReport.icon
      };
    }
  }

  return {
    messages,
    icon: { content: null, url: null, width: null, height: null }
  };
}

export const checkSvgFaviconFile = async (baseUrl: string, url: string, fetcher: Fetcher): Promise<DesktopSingleReport> => {
  const messages: CheckerMessage[] = [];

  const svgUrl = mergeUrlAndPath(baseUrl, url);

  const res = await fetcher(svgUrl, 'image/svg+xml');
  let content;
  let width: number | null = null;
  let height: number | null = null;
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

    content = await readableStreamToString(res.readableStream);
    const meta = await sharp(Buffer.from(content)).metadata();
    width = meta.width || null;
    height = meta.height || null;

    if (width && height && width !== height) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.svgFaviconNotSquare,
        text: `The SVG is not square (${width}x${height})`
      });
    } else {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.svgFaviconSquare,
        text: `The SVG is square (${width}x${height})`
      });
    }
  }

  return {
    messages,
    icon: {
      content: content ? await bufferToDataUrl(Buffer.from(content), 'image/svg+xml') : null,
      url: svgUrl,
      width, height
    }
  };
}

export const checkPngFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<DesktopSingleReport> => {
  const messages: CheckerMessage[] = [];

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return { messages, icon: { content: null, url: null, width: null, height: null } };
  }

  const icons = head?.querySelectorAll("link[rel~='icon'][type='image/png']");
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

  return { messages, icon: { content: null, url: null, width: null, height: null } };
}

export const checkDesktopFavicon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<DesktopFaviconReport> => {
  const svgReport = await checkSvgFavicon(baseUrl, head, fetcher);
  const pngReport = await checkPngFavicon(baseUrl, head, fetcher);
  const icoReport = await checkIcoFavicon(baseUrl, head, fetcher);

  return {
    messages: [ ...svgReport.messages, ...pngReport.messages, ...icoReport.messages ],
    icon: pngReport.icon ? pngReport.icon.content : null,
    icons: {
      png: pngReport.icon,
      ico: icoReport.icon,
      svg: svgReport.icon
    }
  };
}

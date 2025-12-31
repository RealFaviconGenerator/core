import { CheckedIcon, CheckerMessage, CheckerStatus, DesktopSingleReport, Fetcher, MessageId } from "../types";
import { HTMLElement } from 'node-html-parser'
import { bufferToDataUrl, mergeUrlAndPath, readableStreamToBuffer } from "../helper";
import decodeIco from "decode-ico";

export const IcoFaviconSizes = [ 48, 32, 16 ];

export const checkIcoFavicon = async (url: string, head: HTMLElement | null, fetcher: Fetcher): Promise<DesktopSingleReport> => {
  const messages: CheckerMessage[] = [];

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return {
      messages,
      icon : { content: null, url: null, width: null, height: null }
    };
  }

  const icos = [
    ...head.querySelectorAll('link[rel="shortcut icon"]'),
    ...head.querySelectorAll('link[rel="icon"][type="image/x-icon"]')
  ];

  let iconUrl: string | null = null;
  let images;
  let isDeclared = false;

  if (icos.length > 1) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.multipleIcoFavicons,
      text: `There are ${icos.length} ICO favicons`
    });
  } else if (icos.length === 1) {
    isDeclared = true;
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.icoFaviconDeclared,
      text: 'The ICO favicon is declared'
    });

    const href = icos[0].attributes.href;
    if (!href) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.noIcoFaviconHref,
        text: 'The ICO markup has no href attribute'
      });
    } else {
      iconUrl = mergeUrlAndPath(url, href);
    }
  } else {
    // No declared ICO favicon, try the implicit /favicon.ico convention
    iconUrl = mergeUrlAndPath(url, '/favicon.ico');
  }

  // If we have an iconUrl (either from declaration or implicit), try to fetch it
  if (iconUrl) {
    const iconResponse = await fetcher(iconUrl, 'image/x-icon');
    if (iconResponse.status === 404) {
      if (isDeclared) {
        messages.push({
          status: CheckerStatus.Error,
          id: MessageId.icoFavicon404,
          text: `ICO favicon not found at ${iconUrl}`
        });
      } else {
        // Implicit favicon not found, report no ICO favicon
        messages.push({
          status: CheckerStatus.Error,
          id: MessageId.noIcoFavicon,
          text: 'There is no ICO favicon'
        });
        iconUrl = null;
      }
    } else if (iconResponse.status >= 300 || !iconResponse.readableStream) {
      if (isDeclared) {
        messages.push({
          status: CheckerStatus.Error,
          id: MessageId.icoFaviconCannotGet,
          text: `Error fetching ICO favicon at ${iconUrl} (status ${iconResponse.status})`
        });
      } else {
        // Implicit favicon cannot be fetched, report no ICO favicon
        messages.push({
          status: CheckerStatus.Error,
          id: MessageId.noIcoFavicon,
          text: 'There is no ICO favicon'
        });
        iconUrl = null;
      }
    } else {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.icoFaviconDownloadable,
        text: 'ICO favicon found'
      });

      const iconBuffer = await readableStreamToBuffer(iconResponse.readableStream);
      images = decodeIco(iconBuffer);

      const imageSizes = images.map(image => `${image.width}x${image.height}`);

      const expectedSizes = IcoFaviconSizes.map(size => `${size}x${size}`);

      const extraSizes = imageSizes.filter(size => !expectedSizes.includes(size));
      if (extraSizes.length > 0) {
        messages.push({
          status: CheckerStatus.Warning,
          id: MessageId.icoFaviconExtraSizes,
          text: `Extra sizes found in ICO favicon: ${extraSizes.join(', ')}`
        });
      }

      const missingSizes = expectedSizes.filter(size => !imageSizes.includes(size));
      if (missingSizes.length > 0) {
        messages.push({
          status: CheckerStatus.Warning,
          id: MessageId.icoFaviconMissingSizes,
          text: `Missing sizes in ICO favicon: ${missingSizes.join(', ')}`
        });
      }

      if (extraSizes.length === 0 && missingSizes.length === 0) {
        messages.push({
          status: CheckerStatus.Ok,
          id: MessageId.icoFaviconExpectedSizes,
          text: `The ICO favicon has the expected sizes (${imageSizes.join(', ')})`
        });
      }
    }
  }

  const theIcon: CheckedIcon = {
    content: null,
    url: iconUrl,
    width: null,
    height: null
  };
  if (images) {
    const image = images[0];
    const mimeType = (image.type === "bmp") ? "image/bmp" : "image/png";
    theIcon.content = bufferToDataUrl(Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength), mimeType);
    theIcon.width = image.width;
    theIcon.height = image.height;
  }

  return {
    messages,
    icon: theIcon,
  };
}

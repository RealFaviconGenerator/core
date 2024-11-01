import { HTMLElement } from "node-html-parser";
import { CheckerMessage, CheckerStatus, Fetcher, MessageId, WebAppManifestReport } from "./types";
import { CheckIconOutput, CheckIconProcessor, checkIcon, fetchFetcher, mergeUrlAndPath, pathToMimeType } from "./helper";

export const checkWebAppManifest = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<WebAppManifestReport> => {
  const messages: CheckerMessage[] = [];
  let name = undefined;
  let shortName = undefined;
  let backgroundColor = undefined;
  let themeColor = undefined;
  let icon = null;

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  const manifestMarkup = head.querySelectorAll("link[rel='manifest']");
  if (manifestMarkup.length === 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifest,
      text: 'No web app manifest'
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  const href = manifestMarkup[0].getAttribute('href');
  if (!href) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestHref,
      text: 'The web app manifest markup has no `href` attribute'
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  const manifestUrl = mergeUrlAndPath(baseUrl, href);

  const manifest = await fetcher(manifestUrl, 'application/json');

  if (manifest.status === 404) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.manifest404,
      text: `The web app manifest at \`${href}\` is not found`
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  } else if (manifest.status >= 300 || !manifest.readableStream) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.manifestCannotGet,
      text: `Cannot get the web app manifest at \`${href}\` (${manifest.status} error)`
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  let parsedManifest;
  try {
    parsedManifest = await readableStreamToJson(manifest.readableStream);
  } catch(e) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.manifestInvalidJson,
      text: `Cannot parse the web app manifest at \`${href}\``
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  const manifestReport = await checkWebAppManifestFile(parsedManifest, manifestUrl, fetcher);

  return {
    ...manifestReport,
    messages: messages.concat(manifestReport.messages),
  }
}

const readableStreamToJson = async (stream: ReadableStream): Promise<any> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value);
  }
  return JSON.parse(result);
}

export const checkWebAppManifestFile = async (manifest: any, baseUrl: string, fetcher: Fetcher): Promise<WebAppManifestReport> => {
  const messages: CheckerMessage[] = [];
  let icon: CheckIconOutput | null = null;

  const name = manifest.name || undefined;
  if (!name) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestName,
      text: 'The web app manifest has no `name`'
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.manifestName,
      text: `The web app manifest has the name "${name}"`
    });
  }

  const shortName = manifest.short_name || undefined;
  if (!shortName) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestShortName,
      text: 'The web app manifest has no `short_name`'
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.manifestShortName,
      text: `The web app manifest has the short name "${shortName}"`
    });
  }

  const backgroundColor = manifest.background_color || undefined;
  if (!backgroundColor) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestBackgroundColor,
      text: 'The web app manifest has no `background_color`'
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.manifestBackgroundColor,
      text: `The web app manifest has the background color \`${backgroundColor}\``
    });
  }

  const themeColor = manifest.theme_color || undefined;
  if (!themeColor) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestThemeColor,
      text: 'The web app manifest has no `theme_color`'
    });
  } else {
    messages.push({
      status: CheckerStatus.Ok,
      id: MessageId.manifestThemeColor,
      text: `The web app manifest has the theme color \`${themeColor}\``
    });
  }

  const icons = manifest.icons;

  if (!icons || !Array.isArray(icons) || icons.length === 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noManifestIcons,
      text: 'The web app manifest has no `icons`'
    });

    return { messages, name, shortName, backgroundColor, themeColor, icon };
  }

  for await (const size of [ 192, 512 ]) {
    const iconEntry = icons.find((icon: any) => icon.sizes === `${size}x${size}`);
    if (!iconEntry) {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.noManifestIcon,
        text: `The web app manifest has no ${size}x${size} icon`
      });
    } else {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.manifestIconDeclared,
        text: `The web app manifest has a ${size}x${size} icon`
      });

      const iconUrl = mergeUrlAndPath(baseUrl, iconEntry.src);

      const processor: CheckIconProcessor = {
        cannotGet: (status) => {
          messages.push({
            status: CheckerStatus.Error,
            id: MessageId.manifestIconCannotGet,
            text: `The ${size}x${size} icon cannot be fetched (${status})`
          });
        },
        downloadable: () => {
          messages.push({
            status: CheckerStatus.Ok,
            id: MessageId.manifestIconDownloadable,
            text: `The ${size}x${size} icon is downloadable`
          });
        },
        icon404: () => {
          messages.push({
            status: CheckerStatus.Error,
            id: MessageId.manifestIcon404,
            text: `The ${size}x${size} icon is not found`
          });
        },
        noHref: () => {
          messages.push({
            status: CheckerStatus.Error,
            id: MessageId.manifestIconNoHref,
            text: `The ${size}x${size} icon has no \`href\` attribute`
          });
        },
        notSquare: () => {
          messages.push({
            status: CheckerStatus.Error,
            id: MessageId.manifestIconNotSquare,
            text: `The ${size}x${size} icon is not square`
          });
        },
        rightSize: () => {
          messages.push({
            status: CheckerStatus.Ok,
            id: MessageId.manifestIconRightSize,
            text: `The ${size}x${size} icon has the right size`
          });
        },
        square: () => {
          // Ignore this, just check the size
        },
        wrongSize: (actualSize) => {
          messages.push({
            status: CheckerStatus.Error,
            id: MessageId.manifestIconWrongSize,
            text: `The ${size}x${size} icon has the wrong size (${actualSize})`
          });
        }
      };

      icon = await checkIcon(
        iconUrl,
        processor,
        fetcher,
        iconEntry.type || pathToMimeType(iconEntry.src),
        size
      );
    }
  }

  return { messages, name, shortName, backgroundColor, themeColor, icon: icon ? icon.content : null };
}

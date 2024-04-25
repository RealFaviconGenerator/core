import { CheckerMessage, CheckerStatus, Fetcher, MessageId, TouchIconIconReport, TouchIconReport, TouchIconTitleReport } from "./types";
import { HTMLElement } from 'node-html-parser'
import { CheckIconProcessor, checkIcon, fetchFetcher, mergeUrlAndPath } from "./helper";

export const checkTouchIconTitle = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<TouchIconTitleReport> => {
  const messages: CheckerMessage[] = [];
  let appTitle = undefined;

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return { messages };
  }

  const titleMarkup = head.querySelectorAll("meta[name='apple-mobile-web-app-title']");
  if (titleMarkup.length === 0) {
    messages.push({
      status: CheckerStatus.Warning,
      id: MessageId.noTouchWebAppTitle,
      text: 'No touch web app title declared'
    });

    return { messages };
  }

  if (titleMarkup.length > 1) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.multipleTouchWebAppTitles,
      text: `The touch web app title is declared ${titleMarkup.length} times`
    });

    return { messages };
  }

  if (!titleMarkup[0].getAttribute('content')) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.emptyTouchWebAppTitle,
      text: 'The touch web app title has no content'
    });

    return { messages };
  }

  appTitle = titleMarkup[0].getAttribute('content');
  messages.push({
    status: CheckerStatus.Ok,
    id: MessageId.touchWebAppTitleDeclared,
    text: `The touch web app title is "${appTitle}"`
  });

  return { messages, appTitle };
}

export const checkTouchIconIcon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<TouchIconIconReport> => {
  const messages: CheckerMessage[] = [];
  let touchIcon: string | null = null;

  if (!head) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noHead,
      text: 'No <head> element'
    });

    return { messages, touchIcon };
  }

  const iconMarkup = head.querySelectorAll("link[rel='apple-touch-icon']");
  if (iconMarkup.length === 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noTouchIcon,
      text: 'No touch icon declared'
    });

    return { messages, touchIcon };
  }

  messages.push({
    status: CheckerStatus.Ok,
    id: MessageId.touchIconDeclared,
    text: 'The touch icon is declared'
  });

  const sizes = iconMarkup.map(icon => icon.getAttribute('sizes')).filter(size => size);
  if (sizes.length > 0) {
    messages.push({
      status: CheckerStatus.Warning,
      id: MessageId.touchIconWithSize,
      text: `Some Touch icon have a specific size (${sizes.join(', ')})`
    });
  }

  const duplicatedSizes = getDuplicatedSizes(iconMarkup.map(icon => icon.getAttribute('sizes')));
  if (duplicatedSizes.length > 0) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.duplicatedTouchIconSizes,
      text: `The touch icon sizes ${duplicatedSizes.map(s => s || '(no size)').join(', ')} are declared more than once`
    });
  }

  const iconHref = iconMarkup[0].getAttribute('href');
  if (!iconHref) {
    messages.push({
      status: CheckerStatus.Error,
      id: MessageId.noTouchIconHref,
      text: 'The touch icon has no href'
    });

    return { messages, touchIcon };
  }

  const touchIconUrl = mergeUrlAndPath(baseUrl, iconHref);

  const processor: CheckIconProcessor = {
    cannotGet: (status) => {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.touchIconCannotGet,
        text: `The touch icon cannot be fetched (${status})`
      });
    },
    downloadable: () => {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.touchIconDownloadable,
        text: 'The touch icon is downloadable'
      });
    },
    icon404: () => {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.touchIcon404,
        text: `The touch icon at ${touchIconUrl} is not found`
      });
    },
    noHref: () => {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.noTouchIconHref,
        text: 'The touch icon markup has no href'
      });
    },
    notSquare: (width, height) => {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.touchIconNotSquare,
        text: `The touch icon is not square (${width}x${height})`
      });
    },
    rightSize: (width) => {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.touchIconSquare,
        text: `The touch icon is square (${width}x${width})`
      });
    },
    square: (width) => {
      messages.push({
        status: CheckerStatus.Ok,
        id: MessageId.touchIconSquare,
        text: `The touch icon is square (${width}x${width})`
      });
    },
    wrongSize: (width) => {
      messages.push({
        status: CheckerStatus.Error,
        id: MessageId.touchIconWrongSize,
        text: `The touch icon has a wrong size (${width}x${width})`
      });
    }
  }

  touchIcon = await checkIcon(
    touchIconUrl,
    processor,
    fetcher,
    undefined
  );

  return { messages, touchIcon };
}

export const getDuplicatedSizes = (sizes: (string | undefined)[]): (string | undefined)[] => {
  const duplicated = sizes.filter((size, index) => sizes.indexOf(size, index + 1) >= 0);
  return duplicated.filter((size, index) => duplicated.indexOf(size) === index);
}

export const checkTouchIcon = async (baseUrl: string, head: HTMLElement | null, fetcher: Fetcher = fetchFetcher): Promise<TouchIconReport> => {
  const titleReport = await checkTouchIconTitle(baseUrl, head, fetcher);
  const iconReport = await checkTouchIconIcon(baseUrl, head, fetcher);

  return {
    messages: [...titleReport.messages, ...iconReport.messages],
    appTitle: titleReport.appTitle,
    touchIcon: iconReport.touchIcon
  }
}

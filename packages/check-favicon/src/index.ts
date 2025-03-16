
export {
  CheckerStatus,
  MessageId,
  CheckerMessage,
  DesktopFaviconReport,
  TouchIconTitleReport,
  TouchIconIconReport,
  WebAppManifestReport,
  FaviconReport,
  TouchIconReport
} from './types';

export { checkDesktopFavicon, checkSvgFavicon } from "./desktop/desktop"
export { checkTouchIcon } from "./touch-icon"
export { checkWebAppManifest } from "./web-app-manifest"
export { checkFavicon } from "./check"
export { reportHasErrors, reportHasWarnings } from "./helper"

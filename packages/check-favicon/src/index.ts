
export {
  CheckerStatus,
  MessageId,
  CheckerMessage,
  DesktopFaviconReport,
  TouchIconTitleReport,
  TouchIconIconReport,
  WebManifestReport,
  FaviconReport,
  TouchIconReport
} from './types';

export { checkDesktopFavicon, checkSvgFavicon } from "./desktop/desktop"
export { checkTouchIcon } from "./touch-icon"
export { checkWebAppManifest } from "./web-manifest"
export { checkFavicon } from "./check"

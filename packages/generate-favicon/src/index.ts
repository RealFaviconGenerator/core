
export {
  ImageAdapter,
} from './svg/adapter';

export {
  bitmapToSvg, stringToSvg,
  anyUrlToSvg, dataUrlToSvg
} from './svg/index';

export {
  DesktopIconSettings, initDesktopIconSettings
} from './icon/desktop';

export {
  generateDesktopFaviconHtml, generateDesktopFaviconFiles
} from './generation/desktop';

export {
  TouchIconSettings, initTouchIconSettings
} from './icon/ios';

export {
  generateTouchIconHtml, generateTouchIconFiles
} from './generation/touch-icon';

export {
  WebAppManifestSettings, initWebAppManifestSettings
} from './icon/web-app-manifest';

export {
  generateWebAppManifestHtml, generateWebAppManifestIconFiles
} from './generation/web-app-manifest';

export {
  MasterIcon
} from './icon/helper';

export {
  FaviconIconSettings, FaviconSettings, initFaviconIconSettings, generateFaviconFiles, generateFaviconHtml
} from './icon/index';

export {
  normalizeFaviconPath
} from './generation/index';

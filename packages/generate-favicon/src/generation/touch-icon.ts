import { FaviconAssetPathTransformer, FaviconFiles, FaviconMarkups, identityFaviconAssetPathTransformer } from ".";
import { transformSvg } from "../icon/helper";
import { TouchIconSettings } from "../icon/ios";
import { scaleSvg } from "../svg";
import { ImageAdapter } from "../svg/adapter";

export const TouchIconFileName = 'apple-touch-icon.png';
export const TouchIconPngSize = 180;

export const generateTouchIconHtml = (faviconPath: string, appTitle: string | null, transformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer): FaviconMarkups => {
  const markups = [
    `<link rel="apple-touch-icon" sizes="180x180" href="${transformer(`${faviconPath}${TouchIconFileName}`, true, false)}" />`,
  ];
  const cssSelectors = [
    `link[rel="apple-touch-icon"]`
  ];

  if (appTitle) {
    markups.push(`<meta name="apple-mobile-web-app-title" content="${appTitle}" />`);
    cssSelectors.push(`meta[name="apple-mobile-web-app-title"]`);
  }

  return { markups, cssSelectors };
}

export const generateTouchIconFiles = async (settings: TouchIconSettings, imageAdapeter: ImageAdapter): Promise<FaviconFiles> => {
  const transformedIcon = transformSvg(
    settings.icon, settings.transformation, imageAdapeter, TouchIconPngSize
  );

  const touchIcon = await imageAdapeter.convertSvgToPng(
    scaleSvg(transformedIcon, TouchIconPngSize, imageAdapeter)
  );

  return {
    [TouchIconFileName]: touchIcon
  };
}

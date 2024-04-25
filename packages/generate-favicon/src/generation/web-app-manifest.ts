import { FaviconAssetFileNameTransformer, FaviconAssetPathTransformer, FaviconFiles, FaviconMarkups, identityFaviconAssetFileNameTransformer, identityFaviconAssetPathTransformer } from ".";
import { transformSvg } from "../icon/helper";
import { WebAppManifestSettings } from "../icon/web-app-manifest";
import { scaleSvg } from "../svg";
import { ImageAdapter } from "../svg/adapter";

export type WebManifest = {
  name: string,
  short_name: string,
  icons: {
    src: string,
    sizes: string,
    type: string,
    purpose: string
  }[],
  theme_color: string,
  background_color: string,
  display: string
}

export const generateWebManifest = (webManifest: WebManifest): string => {
  return JSON.stringify(webManifest, null, 2);
}

export const SiteWebManifestFileName           = 'site.webmanifest';
export const WebAppManifest192x192IconFileName = 'web-app-manifest-192x192.png';
export const WebAppManifest512x512IconFileName = 'web-app-manifest-512x512.png';

export const generateWebAppManifestHtml = (faviconPath: string, transformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer): FaviconMarkups => {
  return {
    markups: [
      `<link rel="manifest" href="${transformer(`${faviconPath}${SiteWebManifestFileName}`, false, false)}" />`
    ],
    cssSelectors: [
      `link[rel="manifest"]`
    ]
  };
}

export const generateWebAppManifestIconFiles = async (
  settings: WebAppManifestSettings,
  faviconPath: string,
  imageAdapter: ImageAdapter,
  pathTransformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer,
  fileNameTransformer: FaviconAssetFileNameTransformer = identityFaviconAssetFileNameTransformer,
): Promise<FaviconFiles> => {
  const transformedIcon = transformSvg(
    settings.icon, settings.transformation, imageAdapter, 512
  );
  const androidnIcon192 = await imageAdapter.convertSvgToPng(
    scaleSvg(transformedIcon, 192, imageAdapter)
  );
  const androidnIcon512 = await imageAdapter.convertSvgToPng(
    scaleSvg(transformedIcon, 512, imageAdapter)
  );

  const webManifest: WebManifest = {
    name: settings.name,
    short_name: settings.shortName,
    icons: [
      {
        src: pathTransformer(`${faviconPath}${WebAppManifest192x192IconFileName}`, true, true),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: pathTransformer(`${faviconPath}${WebAppManifest512x512IconFileName}`, true, true),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    theme_color: settings.themeColor,
    background_color: settings.backgroundColor,
    display: 'standalone'
  };

  return {
    [fileNameTransformer(WebAppManifest192x192IconFileName)]: androidnIcon192,
    [fileNameTransformer(WebAppManifest512x512IconFileName)]: androidnIcon512,
    [fileNameTransformer(SiteWebManifestFileName)]: generateWebManifest(webManifest)
  };
}

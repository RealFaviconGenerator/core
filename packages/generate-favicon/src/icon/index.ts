import { Svg } from "@svgdotjs/svg.js";
import { DesktopIconSettings, initDesktopIconSettings } from "./desktop";
import { TouchIconSettings, initTouchIconSettings } from "./ios";
import { WebAppManifestSettings, initWebAppManifestSettings } from "./web-app-manifest";
import { IconTransformation } from "./helper";
import { generateDesktopFaviconFiles, generateDesktopFaviconHtml } from "../generation/desktop";
import { generateTouchIconFiles, generateTouchIconHtml } from "../generation/touch-icon";
import { generateWebAppManifestHtml, generateWebAppManifestIconFiles } from "../generation/web-app-manifest";
import { ImageAdapter } from "../svg/adapter";
import { FaviconAssetFileNameTransformer, FaviconAssetPathTransformer, FaviconFiles, FaviconMarkups, identityFaviconAssetFileNameTransformer, identityFaviconAssetPathTransformer } from "../generation";

export type FaviconIconSettings = {
  desktop: DesktopIconSettings,
  touch: TouchIconSettings,
  webAppManifest: WebAppManifestSettings,
}

export type FaviconSettings = {
  icon: FaviconIconSettings,
  path: string
}

export type EditedIcon = {
  icon: Svg,
  transformation: IconTransformation
}

export const initFaviconIconSettings = (svg: Svg): FaviconIconSettings => {
  return {
    desktop: initDesktopIconSettings(svg),
    touch: initTouchIconSettings(svg),
    webAppManifest: initWebAppManifestSettings(svg)
  };
}

export const generateFaviconFiles = async (
  settings: FaviconSettings,
  imageAdapter: ImageAdapter,
  pathTransformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer,
  fileNameTransformer: FaviconAssetFileNameTransformer = identityFaviconAssetFileNameTransformer,
): Promise<FaviconFiles> => (
  Object.assign(
    {},
    await generateDesktopFaviconFiles(
      settings.icon.desktop,
      imageAdapter
    ),
    await generateTouchIconFiles(
      settings.icon.touch,
      imageAdapter
    ),
    await generateWebAppManifestIconFiles(
      settings.icon.webAppManifest,
      settings.path,
      imageAdapter,
      pathTransformer,
      fileNameTransformer
    )
  )
);

export const generateFaviconHtml = (
  settings: FaviconSettings,
  transformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer
): FaviconMarkups => {
  const desktop = generateDesktopFaviconHtml(settings.path, transformer);
  const touch = generateTouchIconHtml(settings.path, settings.icon.touch.appTitle, transformer);
  const webAppManifest = generateWebAppManifestHtml(settings.path, transformer);

  return {
    markups: [
      ...desktop.markups,
      ...touch.markups,
      ...webAppManifest.markups
    ],
    cssSelectors: [
      ...desktop.cssSelectors,
      ...touch.cssSelectors,
      ...webAppManifest.cssSelectors
    ]
  }
};

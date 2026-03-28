
export type FaviconFiles = {
  [key: string]: string | Buffer | Blob;
}

export type FaviconMarkups = {
  markups: string[],
  cssSelectors: string[]
}

export const normalizeFaviconPath = (faviconPath: string): string => {
  if (!faviconPath.startsWith('/')) {
    faviconPath = '/' + faviconPath;
  }
  if (!faviconPath.endsWith('/')) {
    faviconPath += '/';
  }
  return faviconPath;
}

export type FaviconAssetPathTransformer = (path: string, isImage: boolean, isWebAppManifest: boolean, version: string | undefined) => string;

export const identityFaviconAssetPathTransformer: FaviconAssetPathTransformer = (path: string, isImage: boolean, isWebAppManifest: boolean, version: string | undefined) => version ? `${path}?v=${version}` : path;

export type FaviconAssetFileNameTransformer = (fileName: string) => string;

export const identityFaviconAssetFileNameTransformer: FaviconAssetFileNameTransformer = (fileName: string) => fileName;

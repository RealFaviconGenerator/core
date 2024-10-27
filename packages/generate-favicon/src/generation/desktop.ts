import { FaviconAssetPathTransformer, FaviconFiles, FaviconMarkups, identityFaviconAssetPathTransformer } from ".";
import { MasterIcon, transformSvg } from "../icon/helper";
import { createDesktopSvgIcon } from "../svg/desktop";
import { imagesToIco } from "../icon/ico";
import { DesktopIconSettings } from "../icon/desktop";
import { ImageAdapter } from "../svg/adapter";
import { convertSvgToDataUrl } from "../helper";
import { scaleSvg } from "../svg";

export const PngFaviconFileSize = 96;

// Order matters: when given in asc order (16, 32, 48), the icon is corrupted when opend in Chrome.
export const IcoFaviconSizes = [ 48, 32, 16 ];

export const PngFaviconFileName = `favicon-${PngFaviconFileSize}x${PngFaviconFileSize}.png`;
export const SvgFaviconFileName = "favicon.svg";
export const IcoFaviconFileName = "favicon.ico";

function blobToBuffer(blob: Blob): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(Buffer.from(reader.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export const generateDesktopFaviconHtml = (faviconPath: string, transformer: FaviconAssetPathTransformer = identityFaviconAssetPathTransformer): FaviconMarkups => {
  return {
    markups: [
      `<link rel="icon" type="image/png" href="${transformer(`${faviconPath}${PngFaviconFileName}`, true, false)}" sizes="${PngFaviconFileSize}x${PngFaviconFileSize}" />`,
      `<link rel="icon" type="image/svg+xml" href="${transformer(`${faviconPath}${SvgFaviconFileName}`, true, false)}" />`,
      `<link rel="shortcut icon" href="${transformer(`${faviconPath}${IcoFaviconFileName}`, true, false)}" />`
    ],
    cssSelectors: [
      `link[rel="icon"][type="image/png"]`,
      `link[rel="icon"][type="image/svg\\+xml"]`,
      `link[rel="shortcut icon"]`
    ]
  };
}

export const generateDesktopFaviconFiles = async (masterIcon: MasterIcon, settings: DesktopIconSettings, imageAdapter: ImageAdapter): Promise<FaviconFiles> => {
  const transformedRegularSvg = transformSvg(
    masterIcon.icon, settings.regularIconTransformation, imageAdapter, 128
  );

  const regularIcon = await imageAdapter.convertSvgToPng(
    scaleSvg(transformedRegularSvg, PngFaviconFileSize, imageAdapter)
  );

  const theSvg = createDesktopSvgIcon(masterIcon, settings, imageAdapter);

  const pics = await Promise.all(IcoFaviconSizes.map(async size => {
    const data = await imageAdapter.getImageData(convertSvgToDataUrl(theSvg), size);
    return {
      data,
      width: size,
      height: size
    };
  }));
  const ico = imagesToIco(pics);

  return {
    [SvgFaviconFileName]: theSvg.svg(),
    [PngFaviconFileName]: regularIcon,
    [IcoFaviconFileName]: ico
  };
}

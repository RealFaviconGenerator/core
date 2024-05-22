import { SVG, Style, Svg } from "@svgdotjs/svg.js";
import { IconTransformation, IconTransformationType, MasterIcon, getCSSFilter, isCSSFilterTransformation, transformSvg } from "../icon/helper";
import { DesktopIconSettings, hasDarkIcon } from "../icon/desktop";
import { ImageAdapter } from "./adapter";

export const createDesktopSvgIcon = (
  masterIcon: MasterIcon,
  settings: DesktopIconSettings,
  imageAdapter: ImageAdapter
): Svg => {
  // Special case for icons that only play with brightness or color inversion
  if (
    (
      isCSSFilterTransformation(settings.regularIconTransformation.type) ||
      settings.regularIconTransformation.type === IconTransformationType.None
    ) &&
    (
      !hasDarkIcon(settings) ||
      isCSSFilterTransformation(settings.darkIconTransformation.type) ||
      settings.darkIconTransformation.type === IconTransformationType.None
    )
  ) {
    return createFilteredSvgIcon(
      masterIcon.icon, settings.regularIconTransformation, settings.darkIconTransformation
    );
  }

  const lightIcon = transformSvg(masterIcon.icon, settings.regularIconTransformation, imageAdapter);

  // No dark icon? Done!
  if (hasDarkIcon(settings)) {
    return lightIcon;
  }

  const darkIcon = transformSvg(masterIcon.darkIcon || masterIcon.icon, settings.darkIconTransformation, imageAdapter);

  return combineLightAndDaskModeDesktopIcons(lightIcon, darkIcon, imageAdapter);
};

export const createFilteredSvgIcon = (image: Svg, lightSettings?: IconTransformation, darkSettings?: IconTransformation): Svg => {
  const icon = image.clone();

  if (!lightSettings && !darkSettings) {
    return icon;
  }

  let styles = '';
  if (lightSettings) {
    const lightFilter = getCSSFilter(lightSettings);
    styles += `@media (prefers-color-scheme: light) { :root { filter: ${lightFilter}; } }\n`;
  }
  if (darkSettings) {
    const darkFilter = getCSSFilter(darkSettings);
    styles += `@media (prefers-color-scheme: dark) { :root { filter: ${darkFilter}; } }\n`;
  }

  const style = icon.style();
  style.addText(styles);
  icon.add(style);

  return icon;
};

export const combineLightAndDaskModeDesktopIcons = (lightIcon: Svg, darkIcon: Svg, imageAdapter: ImageAdapter): Svg => {
  const s = imageAdapter.createSvg().size(1000, 1000);

  const style = s.style();
  style.addText(`
    #light-icon {
      display: inline;
    }
    #dark-icon {
      display: none;
    }

    @media (prefers-color-scheme: dark) {
      #light-icon {
        display: none;
      }
      #dark-icon {
        display: inline;
      }
    }
  `);
  s.add(style);

  const lightGroup = s.group();
  lightGroup.id('light-icon');
  lightGroup.svg(lightIcon.svg());

  const darkGroup = s.group();
  darkGroup.id('dark-icon');
  darkGroup.svg(darkIcon.svg());

  return s;
}
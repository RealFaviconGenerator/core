import opentype from 'opentype.js';
import { BackgroundType, ContentType, LogoSettings } from './types';
import { Svg } from '@svgdotjs/svg.js';
import { ImageAdapter } from '@realfavicongenerator/generate-favicon';

const imageWidth = 200;
const imageHeight = 200;

export const generateLogo = async (logoSettings: LogoSettings, adapter: ImageAdapter): Promise<Svg> => {
  const font = await opentype.load(logoSettings.content.fontUrl);
  const path = font.getPath(logoSettings.content.text, 0, 0, 20);
  const bbox = path.getBoundingBox();

  const textWidth = bbox.x2 - bbox.x1;
  const textHeight = bbox.y2 - bbox.y1;
  const [ textBaseSize, imageBaseSize ] = (textWidth / imageWidth) > (textHeight / imageHeight)
    ? [ textWidth, imageWidth ]
    : [ textHeight, imageHeight ];
  const textScale = logoSettings.content.scale * imageBaseSize / textBaseSize;
  const newRefX = ((1 - textScale) * textWidth) / 2;
  const newRefY = ((1 - textScale) * textHeight) / 2;
  const centerX = -newRefX - bbox.x1 + (imageWidth - (textWidth * textScale)) / 2;
  const centerY = -newRefY - bbox.y1 + (imageHeight - (textHeight * textScale)) / 2;

  const svg = adapter.createSvg();
  svg.viewbox(0, 0, imageWidth, imageHeight);

  switch(logoSettings.background.type) {
    case(BackgroundType.Color):
      svg.rect(imageWidth, imageHeight).fill(logoSettings.background.color || 'white');
      break;

    case(BackgroundType.Gradient):
      svg.rect(imageWidth, imageHeight).fill("url('#gradient')");
      const defs = svg.defs();
      const gradient = defs.element('linearGradient', {
        id: 'gradient',
        gradientTransform: `rotate(${logoSettings.background.gradient?.angle} 0.5 0.5)`
      });
      gradient.element('stop', {
        offset: '0%',
        'stop-color': logoSettings.background.gradient?.startColor
      });
      gradient.element('stop', {
        offset: '100%',
        'stop-color': logoSettings.background.gradient?.stopColor
      });
      break;
    
    case(BackgroundType.None):
    default:
      break;
  }

  const centeredGroup = svg.group();

  const textGroup = centeredGroup.group()
    .svg(path.toSVG(2))
    .fill(logoSettings.content.color)
    .scale(textScale)
    .translate(centerX, centerY);

  return svg;
}

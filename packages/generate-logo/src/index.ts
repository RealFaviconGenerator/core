import opentype from 'opentype.js';
import fs from 'fs';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';

const imageWidth = 200;
const imageHeight = 180;
const scale = 0.9;

(async () => {
  const font = await opentype.load('Roboto-Black.ttf');
  const path = font.getPath('Hey', 0, 0, 20);
  const bbox = path.getBoundingBox();

  const textWidth = bbox.x2 - bbox.x1;
  const textHeight = bbox.y2 - bbox.y1;
  const [ textBaseSize, imageBaseSize ] = (textWidth / imageWidth) > (textHeight / imageHeight)
    ? [ textWidth, imageWidth ]
    : [ textHeight, imageHeight ];
  const textScale = scale * imageBaseSize / textBaseSize;
  const newRefX = ((1 - textScale) * textWidth) / 2;
  const newRefY = ((1 - textScale) * textHeight) / 2;
  const centerX = -newRefX - bbox.x1 + (imageWidth - (textWidth * textScale)) / 2;
  const centerY = -newRefY - bbox.y1 + (imageHeight - (textHeight * textScale)) / 2;
  const adapter = await getNodeImageAdapter();
  const svg = adapter.createSvg();
  svg.viewbox(0, 0, imageWidth, imageHeight);

  const rect = svg.rect(imageWidth, imageHeight).fill('white').stroke('black');

  const centeredGroup = svg.group();
  centeredGroup

  const textGroup = centeredGroup.group()
    .svg(path.toSVG(2))
    .fill('black')
    .scale(textScale)
    .translate(centerX, centerY);

  fs.writeFileSync('logo.svg', svg.svg());
})();

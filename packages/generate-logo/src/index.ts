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

  const rect = svg.rect(imageWidth, imageHeight).fill("url('#gradient')");

  const centeredGroup = svg.group();
  centeredGroup

  const textGroup = centeredGroup.group()
    .svg(path.toSVG(2))
    .fill('black')
    .scale(textScale)
    .translate(centerX, centerY);

  const defs = svg.defs();
  const gradient = defs.element('linearGradient', {
    id: 'gradient',
    gradientTransform: 'rotate(10)'
  });
  gradient.element('stop', {
    offset: '0%',
    'stop-color': '#FFD700'
  });
  gradient.element('stop', {
    offset: '100%',
    'stop-color': '#FF8C00'
  });

  const emojiGroup = svg.group();
  const emoji = emojiGroup.text('😊').font({ size: 100 }).center(imageWidth / 2, imageHeight / 2);
  // const emojiBbox = emojiGroup.rbox();
  // const emojiScale = 8;
  // const emojiNewRefX = ((1 - textScale) * emojiBbox.width) / 2;
  // const emojiNewRefY = ((1 - textScale) * emojiBbox.height) / 2;
  // const emojiCenterX = -emojiNewRefX - emojiBbox.x + (imageWidth - (emojiBbox.width * emojiScale)) / 2;
  // const emojiCenterY = -emojiNewRefY - emojiBbox.y + (imageHeight - (emojiBbox.height * emojiScale)) / 2;
  // emojiGroup.scale(emojiScale).translate(emojiCenterX, emojiCenterY);
  // console.log("emojiBbox", emojiBbox);
  // const emojiCenterX = (imageWidth - emojiBbox.width) / 2 - emojiBbox.x;
  // const emojiCenterY = (imageHeight - emojiBbox.height) / 2 - emojiBbox.y;
  // emojiGroup.translate(emojiCenterX, emojiCenterY);

  fs.writeFileSync('logo.svg', svg.svg());
})();

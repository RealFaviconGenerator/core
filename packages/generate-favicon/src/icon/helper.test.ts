import { initTransformation, IconTransformationType, innerImageTransform, userBrightnessToCssFilter, isLightColor, numberAliasToNumber } from './helper';

test('numberAliasToNumber', () => {
  expect(numberAliasToNumber(65)).toEqual(65);
  expect(numberAliasToNumber('121px')).toEqual(121);
});

test('innerImageTransform', () => {
  expect(innerImageTransform(
    40, 40, 100, 0.8
  )).toEqual({
    translateX: 30,
    translateY: 30,
    scaleX: 2,
    scaleY: 2,
    originX: 20,
    originY: 20,
  });

  // For https://github.com/RealFaviconGenerator/realfavicongenerator/issues/506,
  // also this is not a verification test strictly speaking
  expect(innerImageTransform(
    121, 121, 20, 1.0
  )).toEqual({
    translateX: -50.5,
    translateY: -50.5,
    scaleX: 0.1652892561983471,
    scaleY: 0.1652892561983471,
    originX: 60.5,
    originY: 60.5,
  });
});

test('initTransformation', () => {
  expect(initTransformation(IconTransformationType.None)).toEqual({
    type: IconTransformationType.None,
    backgroundColor: 'white',
    backgroundRadius: 0.0,
    imageScale: 1.0,
    brightness: 1.0
  });

  expect(initTransformation(IconTransformationType.Invert)).toEqual({
    type: IconTransformationType.Invert,
    backgroundColor: 'white',
    backgroundRadius: 0.0,
    imageScale: 1.0,
    brightness: 1.0
  });

  expect(initTransformation(
    IconTransformationType.Background, {
      backgroundColor: '#456789',
      backgroundRadius: 0.9,
      imageScale: 0.6
    })).toEqual({
      type: IconTransformationType.Background,
      backgroundColor: '#456789',
      backgroundRadius: 0.9,
      imageScale: 0.6,
      brightness: 1.0
  });

  expect(initTransformation(
    IconTransformationType.Brightness, {
      brightness: 1.4
    })).toEqual({
      type: IconTransformationType.Brightness,
      backgroundColor: 'white',
      backgroundRadius: 0.0,
      imageScale: 1.0,
      brightness: 1.4
  });
});

test('userBrightnessToCssFilter', () => {
  expect(userBrightnessToCssFilter(1.0)).toEqual({
    brightness: 1.0,
    contrast: 1.0
  });
  expect(userBrightnessToCssFilter(1.1)).toEqual({
    brightness: 1.1,
    contrast: 1.0
  });
  expect(userBrightnessToCssFilter(1.3)).toEqual({
    brightness: 1.3,
    contrast: 1.0
  });
  expect(userBrightnessToCssFilter(1.55)).toEqual({
    brightness: 1.55,
    contrast: 0.88888888888888888
  });
});

test('isLightColor', () => {
  expect(isLightColor('#000000')).toBe(false);
  expect(isLightColor('#ffffff')).toBe(true);
  expect(isLightColor('#123456')).toBe(false);
  expect(isLightColor('#abcdef')).toBe(true);
})

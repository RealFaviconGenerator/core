import { initTransformation, IconTransformationType, innerImageTransform, userBrightnessToCssFilter, isLightColor } from './helper';

test('innerImageTransform', () => {
  expect(innerImageTransform(
    40, 40, 100, 0.8
  )).toEqual({
    translateX: 30,
    translateY: 30,
    scaleX: 2,
    scaleY: 2,
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

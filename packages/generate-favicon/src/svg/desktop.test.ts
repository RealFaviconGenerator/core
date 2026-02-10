import fs from 'fs/promises';
import path from 'path';
import { cloneSvg, combineLightAndDaskModeDesktopIcons, createFilteredSvgIcon } from './desktop';
import { initTransformation, IconTransformationType } from '../icon/helper';
import { stringToSvg } from '../svg';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';

// See https://github.com/RealFaviconGenerator/core/issues/3
test("createFilteredSvgIcon - Issue #3", async () => {
  const inputPath = path.join(__dirname, '../../fixtures/issue-3-input.svg');
  const outputPath = path.join(__dirname, '../../fixtures/issue-3-output.svg');

  const inputSvg = await fs.readFile(inputPath, 'utf-8');
  const expectedOutput = await fs.readFile(outputPath, 'utf-8');

  const imageAdapter = await getNodeImageAdapter();
  const svg = stringToSvg(inputSvg, imageAdapter);

  const lightTransformation = initTransformation(IconTransformationType.Brightness, {});
  const darkTransformation = initTransformation(IconTransformationType.Brightness, {});

  const result = createFilteredSvgIcon(svg, imageAdapter, lightTransformation, darkTransformation);
  const resultSvg = result.svg();

  expect(resultSvg).toEqual(expectedOutput.trim());
});

test("combineLightAndDaskModeDesktopIcons wraps icons with media query toggling", async () => {
  const imageAdapter = await getNodeImageAdapter();

  const lightIcon = stringToSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="white" width="100" height="100"/></svg>', imageAdapter);
  const darkIcon = stringToSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="black" width="100" height="100"/></svg>', imageAdapter);

  const result = combineLightAndDaskModeDesktopIcons(lightIcon, darkIcon, imageAdapter);
  const resultSvg = result.svg();

  expect(resultSvg).toContain('id="light-icon"');
  expect(resultSvg).toContain('id="dark-icon"');
  expect(resultSvg).toContain('prefers-color-scheme: dark');
});

test("cloneSvg creates a deep copy of the SVG", async () => {
  const inputPath = path.join(__dirname, '../../fixtures/simple.svg');
  const outputPath = path.join(__dirname, '../../fixtures/simple-cloned.svg');

  const inputSvg = await fs.readFile(inputPath, 'utf-8');
  const expectedOutput = await fs.readFile(outputPath, 'utf-8');

  const imageAdapter = await getNodeImageAdapter();
  const originalSvg = stringToSvg(inputSvg, imageAdapter);
  const clone = cloneSvg(originalSvg, imageAdapter);

  expect(clone.svg()).toEqual(expectedOutput);
});

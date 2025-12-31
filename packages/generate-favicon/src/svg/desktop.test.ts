import fs from 'fs/promises';
import path from 'path';
import { cloneSvg, createFilteredSvgIcon } from './desktop';
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

test("cloneSvg creates a deep copy of the SVG", async () => {
  const inputPath = path.join(__dirname, '../../fixtures/simple.svg');
  const inputSvg = await fs.readFile(inputPath, 'utf-8');

  const imageAdapter = await getNodeImageAdapter();
  const originalSvg = stringToSvg(inputSvg, imageAdapter);
  const clone = cloneSvg(originalSvg, imageAdapter);

  const extraPrefix = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="130">';
  const extraSuffix = '</svg>';

  // The original SVG is wrapped two times:
  // - The first time when it is loaded by this very test case
  // - The second time when it is cloned by the cloneSvg function
  // This is okay: we just want to make sure the content is duplicated correctly.
  expect(clone.svg()).toEqual(`${extraPrefix}${extraPrefix}${inputSvg.trim()}${extraSuffix}${extraSuffix}`);
});

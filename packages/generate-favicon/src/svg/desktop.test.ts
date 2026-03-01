import fs from 'fs/promises';
import path from 'path';
import { cloneSvg, combineLightAndDaskModeDesktopIcons, createDesktopSvgIcon, createFilteredSvgIcon } from './desktop';
import { initTransformation, IconTransformationType } from '../icon/helper';
import { DesktopIconSettings, initDesktopIconSettings } from '../icon/desktop';
import { stringToSvg } from '../svg';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';

const INPUT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="red" width="100" height="100"/></svg>';

describe('createDesktopSvgIcon', () => {
  it("with no dark icon and no transformation returns the icon as-is", async () => {
    const imageAdapter = await getNodeImageAdapter();
    const svg = stringToSvg(INPUT_SVG, imageAdapter);

    const settings = initDesktopIconSettings();

    const result = createDesktopSvgIcon({ icon: svg }, settings, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<rect fill="red" width="100" height="100"></rect>' +
      '</svg>'
    );
  });

  it("with brightness filter on regular icon uses optimization path and applies CSS brightness filter", async () => {
    const imageAdapter = await getNodeImageAdapter();
    const svg = stringToSvg(INPUT_SVG, imageAdapter);

    const settings: DesktopIconSettings = {
      regularIconTransformation: initTransformation(IconTransformationType.Brightness, {}),
      darkIconType: 'none',
      darkIconTransformation: initTransformation(IconTransformationType.None, {})
    };

    const result = createDesktopSvgIcon({ icon: svg }, settings, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<rect fill="red" width="100" height="100"></rect>' +
      '<style>' +
      '@media (prefers-color-scheme: light) { :root { filter: contrast(1) brightness(1); } }\n' +
      '</style>' +
      '</svg>'
    );
    expect(resultSvg).toContain('@media (prefers-color-scheme: light) { :root { filter: contrast(1) brightness(1); } }');
    expect(resultSvg).not.toContain('#light-icon');
    expect(resultSvg).not.toContain('#dark-icon');
  });

  it("with regular dark icon and invert filter uses optimization path and applies invert filter in dark mode", async () => {
    const imageAdapter = await getNodeImageAdapter();
    const svg = stringToSvg(INPUT_SVG, imageAdapter);

    const settings = {
      regularIconTransformation: initTransformation(IconTransformationType.None, {}),
      darkIconType: 'regular' as const,
      darkIconTransformation: initTransformation(IconTransformationType.Invert, {})
    };

    const result = createDesktopSvgIcon({ icon: svg }, settings, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<rect fill="red" width="100" height="100"></rect>' +
      '<style>' +
      '@media (prefers-color-scheme: light) { :root { filter: none; } }\n' +
      '@media (prefers-color-scheme: dark) { :root { filter: invert(100%); } }\n' +
      '</style>' +
      '</svg>'
    );
    expect(resultSvg).toContain('@media (prefers-color-scheme: light) { :root { filter: none; } }');
    expect(resultSvg).toContain('@media (prefers-color-scheme: dark) { :root { filter: invert(100%); } }');
    expect(resultSvg).not.toContain('#light-icon');
    expect(resultSvg).not.toContain('#dark-icon');
  });

  it("with background transformation bypasses optimization and returns transformed icon without dark mode switching", async () => {
    const imageAdapter = await getNodeImageAdapter();
    const svg = stringToSvg(INPUT_SVG, imageAdapter);

    const settings = {
      regularIconTransformation: initTransformation(IconTransformationType.Background, {}),
      darkIconType: 'none' as const,
      darkIconTransformation: initTransformation(IconTransformationType.None, {})
    };

    const result = createDesktopSvgIcon({ icon: svg }, settings, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000">' +
      '<g clip-path="url(#SvgjsClipPath1000)">' +
      '<rect width="1000" height="1000" fill="white"></rect>' +
      '<g transform="matrix(10,0,0,10,0,0)">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<rect fill="red" width="100" height="100"></rect>' +
      '</svg>' +
      '</g>' +
      '</g>' +
      '<defs>' +
      '<clipPath id="SvgjsClipPath1000">' +
      '<rect width="1000" height="1000" x="0" y="0" rx="0" ry="0"></rect>' +
      '</clipPath>' +
      '</defs>' +
      '</svg>'
    );
    expect(resultSvg).toContain('fill="red"');
    expect(resultSvg).not.toContain('prefers-color-scheme');
    expect(resultSvg).not.toContain('#light-icon');
    expect(resultSvg).not.toContain('#dark-icon');
  });

  // https://github.com/RealFaviconGenerator/realfavicongenerator/issues/549
  it("with no transformation and no dark icon, preserves embedded dark mode media queries", async () => {
    const imageAdapter = await getNodeImageAdapter();

    const SVG_WITH_DARK_MODE =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<style>:root { fill: darkblue; } @media (prefers-color-scheme: dark) { :root { fill: white; } }</style>' +
      '<rect fill="currentColor" width="100" height="100"/>' +
      '</svg>';

    const svg = stringToSvg(SVG_WITH_DARK_MODE, imageAdapter);
    const settings = initDesktopIconSettings(); // no transformation, no dark icon

    const result = createDesktopSvgIcon({ icon: svg }, settings, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<style>:root { fill: darkblue; } @media (prefers-color-scheme: dark) { :root { fill: white; } }</style>' +
      '<rect fill="currentColor" width="100" height="100"></rect>' +
      '</svg>'
    );
    // Existing dark mode media queries must be preserved
    expect(resultSvg).toContain('@media (prefers-color-scheme: dark)');
    expect(resultSvg).toContain('fill: white');
    // Must not add extra, broken media queries
    expect(resultSvg).not.toContain('filter: none');
    // Must not create excessive SVG nesting (triple-nested SVGs)
    expect((resultSvg.match(/<svg/g) || []).length).toBeLessThanOrEqual(1);
  });

  it("with specific dark icon bypasses optimization and returns combined light/dark icon", async () => {
    const imageAdapter = await getNodeImageAdapter();
    const lightIcon = stringToSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="white" width="100" height="100"/></svg>',
      imageAdapter
    );
    const darkIcon = stringToSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="black" width="100" height="100"/></svg>',
      imageAdapter
    );

    const settings = {
      regularIconTransformation: initTransformation(IconTransformationType.None, {}),
      darkIconType: 'specific' as const,
      darkIconTransformation: initTransformation(IconTransformationType.None, {})
    };

    const result = createDesktopSvgIcon({ icon: lightIcon, darkIcon }, settings, imageAdapter);
    const resultSvg = result.svg();

    const LIGHT_TRANSFORMED =
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000">' +
      '<g><g transform="matrix(10,0,0,10,0,0)">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="white" width="100" height="100"></rect></svg>' +
      '</g></g></svg>';
    const DARK_TRANSFORMED =
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000">' +
      '<g><g transform="matrix(10,0,0,10,0,0)">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="black" width="100" height="100"></rect></svg>' +
      '</g></g></svg>';
    expect(resultSvg).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000">' +
      '<style>\n' +
      '    #light-icon {\n' +
      '      display: inline;\n' +
      '    }\n' +
      '    #dark-icon {\n' +
      '      display: none;\n' +
      '    }\n' +
      '\n' +
      '    @media (prefers-color-scheme: dark) {\n' +
      '      #light-icon {\n' +
      '        display: none;\n' +
      '      }\n' +
      '      #dark-icon {\n' +
      '        display: inline;\n' +
      '      }\n' +
      '    }\n' +
      '  </style>' +
      `<g id="light-icon">${LIGHT_TRANSFORMED}</g>` +
      `<g id="dark-icon">${DARK_TRANSFORMED}</g>` +
      '</svg>'
    );
    expect(resultSvg).toContain('id="light-icon"');
    expect(resultSvg).toContain('id="dark-icon"');
    expect(resultSvg).toContain('prefers-color-scheme: dark');
    expect(resultSvg).toContain('fill="white"');
    expect(resultSvg).toContain('fill="black"');
  });
});

describe('createFilteredSvgIcon', () => {
  // See https://github.com/RealFaviconGenerator/core/issues/3
  it("Issue #3", async () => {
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
});

describe('combineLightAndDaskModeDesktopIcons', () => {
  it("wraps icons with media query toggling", async () => {
    const imageAdapter = await getNodeImageAdapter();

    const lightIcon = stringToSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="white" width="100" height="100"/></svg>', imageAdapter);
    const darkIcon = stringToSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="black" width="100" height="100"/></svg>', imageAdapter);

    const result = combineLightAndDaskModeDesktopIcons(lightIcon, darkIcon, imageAdapter);
    const resultSvg = result.svg();

    expect(resultSvg).toContain('id="light-icon"');
    expect(resultSvg).toContain('id="dark-icon"');
    expect(resultSvg).toContain('prefers-color-scheme: dark');
  });
});

describe('cloneSvg', () => {
  it("creates a deep copy of the SVG", async () => {
    const inputPath = path.join(__dirname, '../../fixtures/simple.svg');
    const outputPath = path.join(__dirname, '../../fixtures/simple-cloned.svg');

    const inputSvg = await fs.readFile(inputPath, 'utf-8');
    const expectedOutput = await fs.readFile(outputPath, 'utf-8');

    const imageAdapter = await getNodeImageAdapter();
    const originalSvg = stringToSvg(inputSvg, imageAdapter);
    const clone = cloneSvg(originalSvg, imageAdapter);

    expect(clone.svg()).toEqual(expectedOutput);
  });
});

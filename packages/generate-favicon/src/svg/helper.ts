// There is an issue with the doctype declaration in the SVG file when running on Node with svgdom.
// See https://github.com/RealFaviconGenerator/realfavicongenerator/issues/507
export const filterDoctypeOut = (svg: string): string => {
  const doctypeRegex = /<!DOCTYPE[^>]*>/gi;
  return svg.replace(doctypeRegex, '');
}

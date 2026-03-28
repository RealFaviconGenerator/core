export const addSvgMetadata = (svg: string, creator: string, sourceUrl: string): string => {
  const metadata =
    '<metadata>' +
    '<rdf:RDF' +
    ' xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '>' +
    '<rdf:Description>' +
    `<dc:creator>${creator}</dc:creator>` +
    `<dc:source>${sourceUrl}</dc:source>` +
    '</rdf:Description>' +
    '</rdf:RDF>' +
    '</metadata>';
  return svg.replace(/(<svg[^>]*>)/, `$1${metadata}`);
};

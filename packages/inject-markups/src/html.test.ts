import { injectMarkupInHtmlHead } from "./html";

test('injectMarktupInHtml - Add markups', () => {
  const input =
`<html>

  <head>
    <title>Test Document</title>
    <meta name="description" content="Just testing markup injection" />
  </head>

  <body>
    <h1>Hey!</h1>
  </body>

</html>`;

  expect(injectMarkupInHtmlHead(
    input,
    [
      '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
      '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
    ], []
  )).toBe(
`<html>

  <head>
    <title>Test Document</title>
    <meta name="description" content="Just testing markup injection">
    <link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">
  </head>

  <body>
    <h1>Hey!</h1>


  </body>

</html>`
  );
});

test('injectMarktupInHtml - Add and remove markups', () => {
  const input =
`<html>

  <head>
    <title>Test Document</title>
    <meta name="description" content="Just testing markup injection" />
  </head>

  <body>
    <h1>Hey!</h1>
  </body>

</html>`;

  expect(injectMarkupInHtmlHead(
    input,
    [
      '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
      '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
    ],
    [
      'meta[name="description"]'
    ]
  )).toBe(
`<html>

  <head>
    <title>Test Document</title>

    <link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">
  </head>

  <body>
    <h1>Hey!</h1>


  </body>

</html>`
  );
});

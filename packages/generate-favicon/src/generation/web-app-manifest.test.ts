import { generateWebManifest } from "./web-app-manifest";

test('generateWebManifest', () => {
  expect(generateWebManifest({
    name: `foo`,
    short_name: `bar`,
    icons: [
      {
        src: `baz.png`,
        sizes: `128x128`,
        type: `image/png`,
        purpose: `maskable`
      }
    ],
    theme_color: `#123456`,
    background_color: `#abcdef`,
    display: `standalone`
  })).toEqual(`{
  "name": "foo",
  "short_name": "bar",
  "icons": [
    {
      "src": "baz.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "theme_color": "#123456",
  "background_color": "#abcdef",
  "display": "standalone"
}`);
})

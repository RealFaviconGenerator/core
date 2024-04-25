# check-favicon

A TypeSCript library to check the favicon of a website.

Install:

```sh
npm install @realfavicongenerator/check-favicon node-html-parser
```

Usage:

```js
import { parse } from 'node-html-parser'

const body = fs.readFileSync('some_page.html');

const root = parse(body);
const head = root.querySelector('head');

const desktopFaviconReport = await checkDesktopFavicon(pageUrl, head);
const touchIconFaviconReport = await checkTouchIcon(pageUrl, head);
const webAppManifestFaviconReport = await checkWebManifest(pageUrl, head);

console.log("Analysis and icons", desktopFaviconReport, touchIconFaviconReport, webAppManifestFaviconReport);
```

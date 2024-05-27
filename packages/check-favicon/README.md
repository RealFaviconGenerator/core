# check-favicon

A TypeSCript library to check the favicon of a website. This library is used by the
[favicon checker](https://realfavicongenerator.net/favicon_checker) of
[RealFaviconGenerator](https://realfavicongenerator.net/).

The checker analyzes an HTML page to produce a report, platform per platform (desktop, iOS, Web app manifest).
The report contains logs, warnings and errors messages, along with the icons themselves.

Install:

```sh
npm install @realfavicongenerator/check-favicon node-html-parser
```

Usage:

```js
import { parse } from 'node-html-parser'
import { checkDesktopFavicon, checkTouchIcon, checkWebAppManifest } from '@realfavicongenerator/check-favicon'

const body = fs.readFileSync('some_page.html');

const root = parse(body);
const head = root.querySelector('head');

const desktopFaviconReport = await checkDesktopFavicon(pageUrl, head);
const touchIconFaviconReport = await checkTouchIcon(pageUrl, head);
const webAppManifestFaviconReport = await checkWebAppManifest(pageUrl, head);

console.log("Analysis and icons", desktopFaviconReport, touchIconFaviconReport, webAppManifestFaviconReport);
```

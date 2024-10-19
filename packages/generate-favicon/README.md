# @realfavicongenerator/generate-favicon

Generate favicon icons and markups from a master icon and settings.

This module is used by the [favicon generator](https://realfavicongenerator.net/) of
[RealFaviconGenerator](https://realfavicongenerator.net/).

## Guided setup

Use RealFaviconGenerator to generate and setup your code in your project.
Simply visit the [favicon generator for Node](https://realfavicongenerator.net/favicon/node)
and follow the instructions.

## Manual setup

Install:

```sh
npm install @realfavicongenerator/generate-favicon @realfavicongenerator/image-adapter-node
```

Usage:

```js
import { FaviconSettings, MasterIcon, bitmapToSvg, dataUrlToSvg, generateFaviconFiles, generateFaviconHtml, stringToSvg } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter, loadAndConvertToSvg } from "@realfavicongenerator/image-adapter-node";

```

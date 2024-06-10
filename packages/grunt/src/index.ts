
/*
 * grunt-real-favicon
 * https://github.com/RealFaviconGenerator/core
 *
 * Copyright (c) 2024 Philippe Bernard
 * Licensed under the MIT license.
 */

'use strict';

import { generateFavicon } from "./generate-favicon";

module.exports = function(grunt: IGrunt) {
  grunt.registerMultiTask('real_favicon', 'You favicon with RealFaviconGenerator and Grunt', function() {
    const done = this.async();
    generateFavicon(this).then(() => done());
  });
};

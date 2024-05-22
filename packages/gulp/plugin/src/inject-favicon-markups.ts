import through from 'through2';
import { injectMarkupInHtmlHead } from '@realfavicongenerator/inject-markups';
import PluginError from 'plugin-error';

var PluginName = '@realfavicongenerator/gulp-real-favicon';

type InjectMarkupsParams = {
  markups: string[],
  cssSelectors: string[]
}

export const injectFaviconMarkups = (params: InjectMarkupsParams) => {
  var stream = through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      const newContent = injectMarkupInHtmlHead(file.contents, params.markups, params.cssSelectors);
      file.contents = Buffer.from(newContent);
      stream.push(file);
      cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PluginName, 'Stream not supported'));
    }
  });

  // returning the file stream
  return stream;
}

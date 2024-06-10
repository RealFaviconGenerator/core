import grunt from 'grunt';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';
import { MasterIcon } from '@realfavicongenerator/generate-favicon';
import { loadAndConvertToSvg } from '@realfavicongenerator/image-adapter-node';
import { FaviconSettings, generateFaviconFiles, generateFaviconHtml } from '@realfavicongenerator/generate-favicon';
import { injectMarkupInHtmlHead } from '@realfavicongenerator/inject-markups';

const toBuffer = async (data: string | Buffer | Blob): Promise<Buffer> => {
  if (data instanceof Buffer) {
    return data;
  }
  if (data instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(Buffer.from(reader.result));
        } else {
          reject(new Error('Failed to convert Blob to Buffer'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read Blob'));
      };
      reader.readAsArrayBuffer(data);
    });
  }
  return Buffer.from(data, 'utf8');
}

export const generateFavicon = async (task: grunt.task.IMultiTask<any>) => {
  console.log("Start...");

  const options: any = task.options({});

  const imageAdapter = await getNodeImageAdapter();

  const masterIcon: MasterIcon = {
    icon: await loadAndConvertToSvg(task.data.src),
  };

  grunt.file.mkdir(task.data.dest);

  const settings: FaviconSettings = options.settings;

  // Generate files
  const files = await generateFaviconFiles(masterIcon, settings, imageAdapter);
  for await (const fileName of Object.keys(files)) {
    const file = files[fileName];
    const filePath = `${task.data.dest}/${fileName}`;
    grunt.file.write(filePath, await toBuffer(file));
  }

  // Generate HTML
  const html = await generateFaviconHtml(settings);

  const htmlFiles = grunt.file.expand({nonull: true}, options.html);
  for await (const file of htmlFiles) {
    if (!grunt.file.exists(file)) {
      grunt.log.verbose.writeln('The file "' + file + '" does not exist, creating the file so markup can be injected.');
      grunt.file.write(file, html.markups.join('\n'));
    } else {
      grunt.log.writeln('Injecting markup into file: ' + file);
      const content = grunt.file.read(file);
      const newContent = injectMarkupInHtmlHead(content, html.markups, html.cssSelectors);
      grunt.file.write(file, newContent);
    }
  }
}

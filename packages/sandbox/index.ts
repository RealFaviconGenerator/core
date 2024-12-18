import { generateFaviconFiles } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter } from "@realfavicongenerator/image-adapter-node";
import { generateLogo} from '@realfavicongenerator/generate-logo';
import fs from 'fs';

(async () => {
  console.log("Hello!");

  const adapter = await getNodeImageAdapter();

  // Write code here and run it!
})();

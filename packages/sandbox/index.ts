import { generateFaviconFiles } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter } from "@realfavicongenerator/image-adapter-node";

(async () => {
  console.log("Hello!");

  const adapter = await getNodeImageAdapter();

  // Write code here and run it!
})();

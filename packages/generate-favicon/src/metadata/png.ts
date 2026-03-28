const PNG_SIGNATURE_LENGTH = 8;
// IHDR: 4 (length) + 4 (type) + 13 (data) + 4 (CRC) = 25 bytes
const IHDR_CHUNK_TOTAL = 25;

const CRC32_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

const crc32 = (bytes: number[]): number => {
  let crc = 0xFFFFFFFF;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const writeUInt32BE = (buf: Buffer, value: number, offset: number): void => {
  buf[offset]     = (value >>> 24) & 0xFF;
  buf[offset + 1] = (value >>> 16) & 0xFF;
  buf[offset + 2] = (value >>>  8) & 0xFF;
  buf[offset + 3] =  value         & 0xFF;
};

const makeTextChunk = (keyword: string, text: string): Buffer => {
  const typeBytes  = [0x74, 0x45, 0x58, 0x74]; // 'tEXt'
  const kwBytes    = [...Buffer.from(keyword, 'latin1')];
  const textBytes  = [...Buffer.from(text, 'latin1')];
  const data       = [...kwBytes, 0x00, ...textBytes];
  const crcValue   = crc32([...typeBytes, ...data]);

  const chunk = Buffer.alloc(4 + 4 + data.length + 4);
  writeUInt32BE(chunk, data.length, 0);
  for (let i = 0; i < 4; i++)         chunk[4 + i] = typeBytes[i];
  for (let i = 0; i < data.length; i++) chunk[8 + i] = data[i];
  writeUInt32BE(chunk, crcValue, 8 + data.length);
  return chunk;
};

export const addPngTextMetadata = (png: Buffer, metadata: Record<string, string>): Buffer => {
  const insertAt = PNG_SIGNATURE_LENGTH + IHDR_CHUNK_TOTAL;
  const chunks = Object.entries(metadata).map(([keyword, text]) => makeTextChunk(keyword, text));
  const totalNewBytes = chunks.reduce((sum, c) => sum + c.length, 0);

  const result = Buffer.alloc(png.length + totalNewBytes);
  for (let i = 0; i < insertAt; i++) result[i] = png[i];
  let pos = insertAt;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) result[pos++] = chunk[i];
  }
  for (let i = insertAt; i < png.length; i++) result[pos++] = png[i];
  return result;
};

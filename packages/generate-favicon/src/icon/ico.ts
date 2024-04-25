import { ImageAndMeta } from "../svg/adapter";

export const imagesToIco = (images: ImageAndMeta[]): Buffer => {
	const header = getHeader(images.length);
	const headerAndIconDir = [header];
	const ImageAndMetaArr: Buffer[] = [];

	let len = header.length;
	let offset = header.length + 16 * images.length;

	images.forEach(img => {
		const dir = getDir(img, offset);
		const bmpInfoHeader = getBmpInfoHeader(img);
		const dib = getDib(img);

		len += dir.length + bmpInfoHeader.length + dib.length;
		const newSize = bmpInfoHeader.length + dib.length;
		offset += newSize;

		dir.writeUInt32LE(newSize, 8);
		headerAndIconDir.push(dir);
		ImageAndMetaArr.push(bmpInfoHeader, dib);
	});

	return Buffer.concat(headerAndIconDir.concat(ImageAndMetaArr), len);
}

function getHeader(numOfImages: number): Buffer {
	const buf = Buffer.alloc(6);

	buf.writeUInt16LE(0, 0); // Reserved. Must always be 0.
	buf.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image
	buf.writeUInt16LE(numOfImages, 4); // Specifies number of images in the file.

	return buf;
}

function getDir(img: ImageAndMeta, offset: number) {
	const buf = Buffer.alloc(16);
	const bitmap = img //.bitmap;
//	const width = bitmap.width >= 256 ? 0 : bitmap.width;
  const width = 48;
	const height = width;
	const bpp = 32;

	buf.writeUInt8(width, 0); // Specifies image width in pixels.
	buf.writeUInt8(height, 1); // Specifies image height in pixels.
	buf.writeUInt8(0, 2); // Should be 0 if the image does not use a color palette.
	buf.writeUInt8(0, 3); // Reserved. Should be 0.
	buf.writeUInt16LE(1, 4); // Specifies color planes. Should be 0 or 1.
	buf.writeUInt16LE(bpp, 6); // Specifies bits per pixel.
	buf.writeUInt32LE(0, 8); // Specifies the size of the image's data in bytes
	buf.writeUInt32LE(offset, 12); // Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file

	return buf;
}

function getBmpInfoHeader(img: ImageAndMeta) {
	const buf = Buffer.alloc(40);
	const bitmap = img; //.bitmap;
	const width = img.width === 256 ? 0 : img.width;
	// https://en.wikipedia.org/wiki/ICO_(file_format)
	// ...Even if the AND mask is not supplied,
	// if the image is in Windows BMP format,
	// the BMP header must still specify a doubled height.
	const height = img.height === 256 ? 0 : img.height;
	const bpp = 32;

	buf.writeUInt32LE(40, 0); // The size of this header (40 bytes)
	buf.writeInt32LE(width, 4); // The bitmap width in pixels (signed integer)
	buf.writeInt32LE(2 * height, 8); // The bitmap height in pixels (signed integer)
	buf.writeUInt16LE(1, 12); // The number of color planes (must be 1)
	buf.writeUInt16LE(bpp, 14); // The number of bits per pixel
	buf.writeUInt32LE(0, 16); // The compression method being used.
	buf.writeUInt32LE(40 + width * height, 20); // The image size.
	buf.writeInt32LE(0, 24); // The horizontal resolution of the image. (signed integer)
	buf.writeInt32LE(0, 28); // The vertical resolution of the image. (signed integer)
	buf.writeUInt32LE(0, 32); // The number of colors in the color palette, or 0 to default to 2n
	buf.writeUInt32LE(0, 36); // The number of important colors used, or 0 when every color is important; generally ignored.

	return buf;
}

// https://en.wikipedia.org/wiki/BMP_file_format
// Note that the bitmap data starts with the lower left hand corner of the image.
// blue green red alpha in order
function getDib(img: ImageAndMeta) {
	const bitmap = img; //.bitmap;
	const size = bitmap.data.length;
	const width = bitmap.width;
	const height = width;
	const andMapRow = getRowStride(width);
	const andMapSize = andMapRow * height;
	const buf = Buffer.alloc(size + andMapSize);
	// xor map
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const pxColor = getPixelColor(img, x, y);

			const r = (pxColor >> 24) & 255;
			const g = (pxColor >> 16) & 255;
			const b = (pxColor >> 8) & 255;
			const a = pxColor & 255;
			const newColor = b | (g << 8) | (r << 16) | (a << 24);

			const pos = ((height - y - 1) * width + x) * 4;

			buf.writeInt32LE(newColor, pos);
		}
	}

	// and map. It's padded out to 32 bits per line
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const pxColor = getPixelColor(img, x, y);
			// TODO make threshhold configurable
			const alpha = (pxColor & 255) > 0 ? 0 : 1;
			const bitNum = (height - y - 1) * width + x;
			// width per line in multiples of 32 bits
			const width32 =
				width % 32 === 0 ? Math.floor(width / 32) : Math.floor(width / 32) + 1;

			const line = Math.floor(bitNum / width);
			const offset = Math.floor(bitNum % width);
			const bitVal = alpha & 0x00000001;

			const pos = size + line * width32 * 4 + Math.floor(offset / 8);
			const newVal = buf.readUInt8(pos) | (bitVal << (7 - (offset % 8)));
			buf.writeUInt8(newVal, pos);
		}
	}

	return buf;
}

function getRowStride(width: number) {
	if (width % 32 === 0) {
		return width / 8;
	} else {
		return 4 * (Math.floor(width / 32) + 1);
	}
}

function getPixelColor(png: ImageAndMeta, x: number, y: number) {
	let xi = x < 0 ? 0: x;
	let yi = y < 0 ? 0: y;

	if (x >= png.width) xi = png.width - 1;
	if (y >= png.height) yi = png.height - 1;

	const i = (xi < 0 || xi >= png.width) || (yi < 0 || yi >= png.height)
		? -1
		: (png.width * yi + xi) << 2
	;
		
	return png.data.readUInt32BE(i);
}

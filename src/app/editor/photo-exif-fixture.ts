const EXIF_DATE_LENGTH = 20;

export function jpegWithExifDate(fileName: string, entries: readonly ExifDate[]): File {
  return new File([blobPart(jpegBytes(entries))], fileName, { type: 'image/jpeg' });
}

export function heicWithExifDate(
  fileName: string,
  entries: readonly ExifDate[],
  type = 'image/heic',
): File {
  return new File([blobPart(heicBytes(entries))], fileName, { type });
}

interface ExifDate {
  tag: number;
  value: string;
}

function jpegBytes(entries: readonly ExifDate[]): Uint8Array {
  const exif = tiffBytes(entries);
  const bytes = new Uint8Array(12 + exif.length + 2);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[3] = 0xe1;
  view.setUint16(4, 8 + exif.length);
  writeAscii(bytes, 6, 'Exif\0\0');
  bytes.set(exif, 12);
  bytes[bytes.length - 2] = 0xff;
  bytes[bytes.length - 1] = 0xd9;
  return bytes;
}

function heicBytes(entries: readonly ExifDate[]): Uint8Array {
  const tiff = tiffBytes(entries);
  const exifPayload = new Uint8Array(4 + tiff.length);
  exifPayload.set(tiff, 4);

  const ftyp = new Uint8Array(20);
  new DataView(ftyp.buffer).setUint32(0, ftyp.length);
  writeAscii(ftyp, 4, 'ftyp');
  writeAscii(ftyp, 8, 'heic');
  writeAscii(ftyp, 16, 'heic');

  const infe = new Uint8Array(20);
  const infeView = new DataView(infe.buffer);
  infeView.setUint32(0, infe.length);
  writeAscii(infe, 4, 'infe');
  infe[8] = 2;
  infeView.setUint16(12, 1);
  writeAscii(infe, 16, 'Exif');

  const iinf = new Uint8Array(14 + infe.length);
  const iinfView = new DataView(iinf.buffer);
  iinfView.setUint32(0, iinf.length);
  writeAscii(iinf, 4, 'iinf');
  iinf[8] = 2;
  iinfView.setUint16(12, 1);
  iinf.set(infe, 14);

  const iloc = new Uint8Array(30);
  const ilocView = new DataView(iloc.buffer);
  ilocView.setUint32(0, iloc.length);
  writeAscii(iloc, 4, 'iloc');
  iloc[12] = 0x44;
  ilocView.setUint16(14, 1);
  ilocView.setUint16(16, 1);
  ilocView.setUint16(20, 1);

  const metaLength = 12 + iinf.length + iloc.length;
  const exifOffset = ftyp.length + metaLength;
  ilocView.setUint32(22, exifOffset);
  ilocView.setUint32(26, exifPayload.length);

  const meta = new Uint8Array(metaLength);
  const metaView = new DataView(meta.buffer);
  metaView.setUint32(0, metaLength);
  writeAscii(meta, 4, 'meta');
  meta.set(iinf, 12);
  meta.set(iloc, 12 + iinf.length);

  const bytes = new Uint8Array(exifOffset + exifPayload.length);
  bytes.set(ftyp, 0);
  bytes.set(meta, ftyp.length);
  bytes.set(exifPayload, exifOffset);
  return bytes;
}

function tiffBytes(entries: readonly ExifDate[]): Uint8Array {
  const exifOffset = 26;
  const stringsOffset = exifOffset + 2 + entries.length * 12 + 4;
  const bytes = new Uint8Array(stringsOffset + entries.length * EXIF_DATE_LENGTH);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0x49;
  bytes[1] = 0x49;
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, 1, true);
  view.setUint16(10, 0x8769, true);
  view.setUint16(12, 4, true);
  view.setUint32(14, 1, true);
  view.setUint32(18, exifOffset, true);
  view.setUint16(exifOffset, entries.length, true);

  entries.forEach((entry, index) => {
    const entryOffset = exifOffset + 2 + index * 12;
    const stringOffset = stringsOffset + index * EXIF_DATE_LENGTH;
    view.setUint16(entryOffset, entry.tag, true);
    view.setUint16(entryOffset + 2, 2, true);
    view.setUint32(entryOffset + 4, EXIF_DATE_LENGTH, true);
    view.setUint32(entryOffset + 8, stringOffset, true);
    writeAscii(bytes, stringOffset, `${entry.value}\0`);
  });

  return bytes;
}

function blobPart(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function writeAscii(bytes: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}

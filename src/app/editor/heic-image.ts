import { InjectionToken } from '@angular/core';

export const HEIC_DECODER = new InjectionToken<(file: Blob) => Promise<Blob>>('HEIC_DECODER', {
  providedIn: 'root',
  factory: () => decodeHeic,
});

export async function decodeHeic(file: Blob): Promise<Blob> {
  const { heicTo } = await import('heic-to');
  return heicTo({
    blob: file,
    type: 'image/jpeg',
    quality: 0.92,
  });
}

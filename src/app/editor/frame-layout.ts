export const EXPORT_DPI = 300;
export const CARD_LONG_MM = 150;
export const CARD_SHORT_MM = 100;
export const BORDER_MM = 0.6;
export const PAD_TOP_MM = 10 / 3;
export const PAD_SIDE_MM = 10 / 3;
export const PAD_BOTTOM_MM = 28 / 3;
export const CAPTION_SIZE_MM = 3.5;

export type Orientation = 'landscape' | 'portrait';

export interface FrameSpec {
  orientation: Orientation;
  cardWidthMm: number;
  cardHeightMm: number;
  borderMm: number;
  padTopMm: number;
  padSideMm: number;
  padBottomMm: number;
  captionSizeMm: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameLayout {
  canvas: { width: number; height: number };
  photo: Rect;
  borderOuter: Rect;
  borderWidthPx: number;
  captionFontSizePx: number;
  captionCenterY: number;
  leftCaptionX: number;
  rightCaptionX: number;
  leftCaptionMaxWidth: number;
  rightCaptionMaxWidth: number;
}

export interface CoverCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface CoverSlack {
  scale: number;
  maxPanX: number;
  maxPanY: number;
}

export function mmToPx(mm: number, dpi = EXPORT_DPI): number {
  return (mm / 25.4) * dpi;
}

export function orientationOf(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait';
}

export function frameSpec(orientation: Orientation): FrameSpec {
  const landscape = orientation === 'landscape';
  return {
    orientation,
    cardWidthMm: landscape ? CARD_LONG_MM : CARD_SHORT_MM,
    cardHeightMm: landscape ? CARD_SHORT_MM : CARD_LONG_MM,
    borderMm: BORDER_MM,
    padTopMm: PAD_TOP_MM,
    padSideMm: PAD_SIDE_MM,
    padBottomMm: PAD_BOTTOM_MM,
    captionSizeMm: CAPTION_SIZE_MM,
  };
}

export function clampUnit(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function buildFrameLayout(orientation: Orientation, dpi = EXPORT_DPI): FrameLayout {
  const spec = frameSpec(orientation);
  const padSide = Math.round(mmToPx(spec.padSideMm, dpi));
  const padTop = Math.round(mmToPx(spec.padTopMm, dpi));
  const padBottom = Math.round(mmToPx(spec.padBottomMm, dpi));
  const border = Math.round(mmToPx(spec.borderMm, dpi));
  const canvasWidth = Math.round(mmToPx(spec.cardWidthMm, dpi));
  const canvasHeight = Math.round(mmToPx(spec.cardHeightMm, dpi));
  const photoWidth = canvasWidth - padSide * 2 - border * 2;
  const photoHeight = canvasHeight - padTop - padBottom - border * 2;
  const photo: Rect = {
    x: padSide + border,
    y: padTop + border,
    width: photoWidth,
    height: photoHeight,
  };
  const borderOuter: Rect = {
    x: padSide,
    y: padTop,
    width: photoWidth + border * 2,
    height: photoHeight + border * 2,
  };
  const photoCenterX = photo.x + photo.width / 2;

  const bandTop = borderOuter.y + borderOuter.height;

  return {
    canvas: { width: canvasWidth, height: canvasHeight },
    photo,
    borderOuter,
    borderWidthPx: border,
    captionFontSizePx: Math.round(mmToPx(spec.captionSizeMm, dpi)),
    captionCenterY: bandTop + Math.round((canvasHeight - bandTop) / 2),
    leftCaptionX: photo.x,
    rightCaptionX: photo.x + photo.width,
    leftCaptionMaxWidth: photoCenterX - photo.x,
    rightCaptionMaxWidth: photo.x + photo.width - photoCenterX,
  };
}

export function coverSlack(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
): CoverSlack {
  if (imageWidth <= 0 || imageHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) {
    return { scale: 1, maxPanX: 0, maxPanY: 0 };
  }

  const scale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  return {
    scale,
    maxPanX: Math.max(0, imageWidth * scale - frameWidth),
    maxPanY: Math.max(0, imageHeight * scale - frameHeight),
  };
}

export function coverCrop(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  panX: number,
  panY: number,
): CoverCrop {
  const slack = coverSlack(imageWidth, imageHeight, frameWidth, frameHeight);
  if (imageWidth <= 0 || imageHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) {
    return { sx: 0, sy: 0, sw: 0, sh: 0 };
  }

  const sw = frameWidth / slack.scale;
  const sh = frameHeight / slack.scale;
  return {
    sx: (slack.maxPanX * clampUnit(panX)) / slack.scale,
    sy: (slack.maxPanY * clampUnit(panY)) / slack.scale,
    sw,
    sh,
  };
}

export function captionFontScale(measuredWidth: number, maxWidth: number): number {
  if (measuredWidth <= 0 || maxWidth <= 0 || measuredWidth <= maxWidth) {
    return 1;
  }
  return maxWidth / measuredWidth;
}

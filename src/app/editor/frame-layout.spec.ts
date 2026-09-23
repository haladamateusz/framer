import {
  buildFrameLayout,
  captionFontScale,
  clampUnit,
  coverCrop,
  mmToPx,
  orientationOf,
} from './frame-layout';

describe('frame layout', () => {
  it('treats square and landscape photos as 15 by 10', () => {
    expect(orientationOf(1500, 1000)).toBe('landscape');
    expect(orientationOf(1000, 1000)).toBe('landscape');
    expect(orientationOf(1000, 1500)).toBe('portrait');
  });

  it('converts millimetres at 300 dpi', () => {
    expect(mmToPx(25.4, 300)).toBe(300);
  });

  it('places the black rule outside the photo and centers captions on the image', () => {
    const layout = buildFrameLayout('landscape');

    expect(layout.canvas.width).toBe(Math.round(mmToPx(150)));
    expect(layout.canvas.height).toBe(Math.round(mmToPx(100)));
    expect(layout.canvas.width / layout.canvas.height).toBeCloseTo(1.5, 2);
    expect(layout.photo.width).toBeGreaterThan(layout.photo.height);
    expect(layout.photo.x).toBeCloseTo(layout.borderOuter.x + layout.borderWidthPx);
    expect(layout.photo.y).toBeCloseTo(layout.borderOuter.y + layout.borderWidthPx);
    expect(layout.borderOuter.width).toBeCloseTo(layout.photo.width + layout.borderWidthPx * 2);
    expect(layout.leftCaptionX).toBe(layout.photo.x);
    expect(layout.rightCaptionX).toBe(layout.photo.x + layout.photo.width);
    const bandTop = layout.borderOuter.y + layout.borderOuter.height;
    expect(layout.captionCenterY).toBe(bandTop + Math.round((layout.canvas.height - bandTop) / 2));
    expect(layout.captionCenterY).toBeGreaterThan(layout.photo.y + layout.photo.height);
    expect(layout.leftCaptionMaxWidth).toBeGreaterThan(0);
    expect(layout.rightCaptionMaxWidth).toBeGreaterThan(0);
  });

  it('uses a 10 by 15 card for a portrait photo', () => {
    const layout = buildFrameLayout('portrait');

    expect(layout.canvas.width).toBe(Math.round(mmToPx(100)));
    expect(layout.canvas.height).toBe(Math.round(mmToPx(150)));
    expect(layout.canvas.width / layout.canvas.height).toBeCloseTo(2 / 3, 2);
    expect(layout.photo.height).toBeGreaterThan(layout.photo.width);
  });

  it('centers a cover crop and clamps the pan', () => {
    const crop = coverCrop(4000, 2000, 1500, 1000, 0.5, 0.5);

    expect(crop.sw).toBeCloseTo(3000);
    expect(crop.sh).toBeCloseTo(2000);
    expect(crop.sx).toBeCloseTo(500);
    expect(crop.sy).toBeCloseTo(0);
    expect(clampUnit(-0.2)).toBe(0);
    expect(clampUnit(1.4)).toBe(1);
  });

  it('shrinks a caption only when it would cross the center', () => {
    expect(captionFontScale(80, 120)).toBe(1);
    expect(captionFontScale(200, 100)).toBeCloseTo(0.5);
    expect(captionFontScale(0, 100)).toBe(1);
  });
});

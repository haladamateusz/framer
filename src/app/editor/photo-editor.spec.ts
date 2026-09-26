import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { HEIC_DECODER } from './heic-image';
import { PhotoEditor } from './photo-editor';
import { heicWithExifDate, jpegWithExifDate } from './photo-exif-fixture';

const decodeHeic = vi.fn<(file: Blob) => Promise<Blob>>();

describe('PhotoEditor', () => {
  let fixture: ComponentFixture<PhotoEditor>;

  beforeEach(async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.stubGlobal('Image', FakeImage);

    decodeHeic.mockReset();
    decodeHeic.mockRejectedValue(new Error('decode'));

    await TestBed.configureTestingModule({
      imports: [PhotoEditor],
      providers: [{ provide: HEIC_DECODER, useValue: decodeHeic }],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoEditor);
    await fixture.whenStable();
  });

  afterEach(() => {
    FakeImage.failNext = false;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects a file that is not a photo', async () => {
    chooseFile(fileInput(fixture), new File(['notes'], 'notes.txt', { type: 'text/plain' }));
    await fixture.whenStable();

    expect(text(fixture)).toContain('Please choose a JPEG, PNG, WebP, or HEIC image.');
    expect(text(fixture)).toContain('Choose a photo');
  });

  it('shows the file name on the photo', async () => {
    await loadPortrait(fixture);

    const name = fixture.nativeElement.querySelector('.photo-name');
    expect(name?.textContent).toBe('dog.png');
  });

  it('fills the date from the photo capture date', async () => {
    chooseFile(
      fileInput(fixture),
      jpegWithExifDate('pier.jpg', [{ tag: 0x9003, value: '2024:06:15 10:30:00' }]),
    );

    await vi.waitFor(() => {
      expect(text(fixture)).toContain('15 czerwca 2024');
    });
  });

  it('shows a HEIC photo the browser can decode directly', async () => {
    chooseFile(
      fileInput(fixture),
      heicWithExifDate('pier.heic', [{ tag: 0x9004, value: '2023:01:02 08:00:00' }]),
    );

    await vi.waitFor(() => {
      expect(text(fixture)).toContain('2 stycznia 2023');
    });

    expect(decodeHeic).not.toHaveBeenCalled();
    expect(text(fixture)).toContain('pier.heic');
    expect(text(fixture)).toContain('Remove');
  });

  it('converts a HEIC photo when the browser cannot decode it', async () => {
    decodeHeic.mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
    FakeImage.failNext = true;
    chooseFile(
      fileInput(fixture),
      heicWithExifDate('pier.heic', [{ tag: 0x9004, value: '2023:01:02 08:00:00' }]),
    );

    await vi.waitFor(() => {
      expect(text(fixture)).toContain('2 stycznia 2023');
    });

    expect(decodeHeic).toHaveBeenCalledOnce();
    expect(text(fixture)).toContain('pier.heic');
    expect(text(fixture)).toContain('Remove');
    expect(text(fixture)).not.toContain('cannot display HEIC');
  });

  it('fills the date from a HEIC file this browser cannot display', async () => {
    FakeImage.failNext = true;
    chooseFile(
      fileInput(fixture),
      heicWithExifDate('pier.heic', [{ tag: 0x9004, value: '2023:01:02 08:00:00' }]),
    );

    await vi.waitFor(() => {
      expect(text(fixture)).toContain('2 stycznia 2023');
    });
    expect(text(fixture)).toContain(
      'This browser cannot display HEIC photos. The created date was filled in from the file.',
    );
    expect(text(fixture)).toContain('Choose a photo');
  });

  it('keeps the current photo when a HEIC file cannot be displayed', async () => {
    state(fixture).captionModel.set({ left: '2026-09-12', right: '' });
    await loadPortrait(fixture);

    FakeImage.failNext = true;
    chooseFile(
      fileInput(fixture),
      heicWithExifDate('pier.heic', [{ tag: 0x9004, value: '2023:01:02 08:00:00' }]),
    );

    await vi.waitFor(() => {
      expect(text(fixture)).toContain('This browser cannot display HEIC photos.');
    });

    expect(text(fixture)).toContain('12 września 2026');
    expect(text(fixture)).not.toContain('2 stycznia 2023');
    expect(text(fixture)).toContain('Remove');
  });

  it('keeps a chosen date when the photo has no created date', async () => {
    state(fixture).captionModel.set({ left: '2026-09-12', right: '' });
    await loadPortrait(fixture);

    expect(text(fixture)).toContain('12 września 2026');
  });

  it('keeps the date when the photo is removed', async () => {
    state(fixture).captionModel.set({ left: '2026-09-12', right: 'Cafe' });
    await loadPortrait(fixture);

    expect(text(fixture)).toContain('12 września 2026');

    button(fixture, 'Remove').click();
    await fixture.whenStable();

    expect(text(fixture)).toContain('Choose a photo');
    expect(text(fixture)).toContain('12 września 2026');
  });

  it('saves the framed photo through the share sheet on a phone', async () => {
    await loadPortrait(fixture);
    stubCanvasExport(fixture);
    stubCoarsePointer(true);
    const share = vi.fn().mockResolvedValue(undefined);
    const restoreShare = stubShare(share);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    button(fixture, 'Download').click();
    await fixture.whenStable();

    expect(share).toHaveBeenCalledOnce();
    const shared = share.mock.calls[0]?.[0] as { files: File[] };
    expect(shared.files[0]?.name).toBe('dog-framed.png');
    expect(shared.files[0]?.type).toBe('image/png');
    expect(click).not.toHaveBeenCalled();
    restoreShare();
  });

  it('downloads a file when the phone cannot share images', async () => {
    await loadPortrait(fixture);
    stubCanvasExport(fixture);
    stubCoarsePointer(true);
    const restoreShare = stubShare(vi.fn(), false);
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });

    button(fixture, 'Download').click();

    expect(downloads).toEqual(['dog-framed.png']);
    restoreShare();
  });

  it('resets the zoom when another photo is loaded', async () => {
    await loadPortrait(fixture);
    const overlay = fixture.nativeElement.querySelector('.photo-overlay') as HTMLElement;
    overlay.getBoundingClientRect = () => new DOMRect(0, 0, 200, 300);
    overlay.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, clientX: 40, clientY: 40 }));
    await fixture.whenStable();

    expect(state(fixture).zoom()).toBeGreaterThan(1);

    await loadPortrait(fixture);

    expect(state(fixture).zoom()).toBe(1);
  });
});

function state(fixture: ComponentFixture<PhotoEditor>) {
  return fixture.componentInstance as unknown as {
    zoom(): number;
    captionModel: { set(value: { left: string; right: string }): void };
  };
}

function fileInput(fixture: ComponentFixture<PhotoEditor>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#photoFile');
}

function text(fixture: ComponentFixture<PhotoEditor>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function button(fixture: ComponentFixture<PhotoEditor>, name: string): HTMLButtonElement {
  const match = [...fixture.nativeElement.querySelectorAll('button')].find((element) =>
    element.textContent?.includes(name),
  );
  if (!(match instanceof HTMLButtonElement)) {
    throw new Error(`Missing ${name} button`);
  }
  return match;
}

function stubCanvasExport(fixture: ComponentFixture<PhotoEditor>): void {
  const canvas = fixture.nativeElement.querySelector('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Missing preview canvas');
  }
  canvas.toDataURL = () => `data:image/png;base64,${btoa('framed')}`;
}

function stubCoarsePointer(coarse: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) =>
      ({
        matches: coarse && query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
}

function stubShare(share: ReturnType<typeof vi.fn>, canShare = true): () => void {
  const navigatorWithShare = navigator as Navigator & {
    share?: Navigator['share'];
    canShare?: Navigator['canShare'];
  };
  const originalShare = navigatorWithShare.share;
  const originalCanShare = navigatorWithShare.canShare;
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'canShare', {
    configurable: true,
    value: () => canShare,
  });
  return () => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: originalShare });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: originalCanShare });
  };
}

function chooseFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: {
      0: file,
      length: 1,
      item: () => file,
    },
  });
  input.dispatchEvent(new Event('change'));
}

async function loadPortrait(fixture: ComponentFixture<PhotoEditor>): Promise<void> {
  chooseFile(fileInput(fixture), new File(['photo'], 'dog.png', { type: 'image/png' }));
  await fixture.whenStable();
}

class FakeImage {
  static failNext = false;
  naturalWidth = 800;
  naturalHeight = 1200;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    if (FakeImage.failNext) {
      FakeImage.failNext = false;
      this.onerror?.();
      return;
    }

    this.onload?.();
  }
}

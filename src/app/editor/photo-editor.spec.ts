import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { PhotoEditor } from './photo-editor';

describe('PhotoEditor', () => {
  let fixture: ComponentFixture<PhotoEditor>;

  beforeEach(async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.stubGlobal('Image', FakeImage);

    await TestBed.configureTestingModule({
      imports: [PhotoEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoEditor);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects a file that is not a photo', async () => {
    chooseFile(fileInput(fixture), new File(['notes'], 'notes.txt', { type: 'text/plain' }));
    await fixture.whenStable();

    expect(text(fixture)).toContain('Please choose a JPEG, PNG, or WebP image.');
    expect(text(fixture)).toContain('Choose a photo');
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
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

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
  naturalWidth = 800;
  naturalHeight = 1200;
  onload: (() => void) | null = null;

  set src(_value: string) {
    this.onload?.();
  }
}

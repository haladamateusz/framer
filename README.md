# Photo frame

Frame a photo with a thin black rule, a white mat, and two captions, then download a 300 DPI PNG.

The whole card is 15×10 cm for a landscape photo and 10×15 cm for a portrait photo. Square photos use the landscape card. Inside it, the mat is about 3.3 mm on the top and sides and 9.3 mm on the bottom. Captions are set in [Geist](https://fonts.google.com/specimen/Geist) and align with the outer edge of the black rule.

## Use

1. Start the app and open `http://localhost:4200/`.
2. Click **Choose a photo**, or drop a JPEG, PNG, or WebP file onto the opening.
3. Drag inside the photo, or focus the preview and use the arrow keys, to reposition the crop.
4. Choose a date and type a right caption in the fields above the card.
5. Click **Download**, under the card on the right, to save `{original-name}-framed.png`.

**Replace** and **Remove** sit on the photo. Remove unloads the photo and keeps the caption text.

## Development

```bash
npm start
```

```bash
npm test
```

```bash
npm run build
```

The production build is written to `dist/`. Frame measurements live in `src/app/editor/frame-layout.ts`.

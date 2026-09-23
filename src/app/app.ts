import { Component } from '@angular/core';

import { PhotoEditor } from './editor/photo-editor';

@Component({
  selector: 'app-root',
  imports: [PhotoEditor],
  template: '<app-photo-editor />',
})
export class App {}

import { Component } from '@angular/core';

import { PhotoEditor } from './editor/photo-editor';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [Navbar, PhotoEditor],
  template: `
    <div class="shell">
      <app-navbar />
      <app-photo-editor />
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }

    .shell {
      display: flex;
      min-height: 100dvh;
      flex-direction: column;
    }
  `,
})
export class App {}

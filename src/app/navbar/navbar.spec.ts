import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the app name as the home link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const home = compiled.querySelector('a');

    expect(compiled.querySelector('h1')?.textContent).toContain('framer');
    expect(home?.getAttribute('href')).toBe('/');
    expect(home?.getAttribute('aria-current')).toBe('page');
  });
});

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Firestore } from '@angular/fire/firestore';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: Firestore, useValue: {} }] 
    }).compileComponents();
  });

  it('should save search term to localStorage on change', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.searchTerm = 'Toyota';
    app.updateSearch();
    expect(localStorage.getItem('johnsLastSearch')).toBe('Toyota');
  });

  it('should have a download button for John', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-download')?.textContent).toContain('Download Backup');
  });
});
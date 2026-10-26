import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('deve apresentar o editor vazio e orientar sobre o cadastro de pessoas', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#editor-title')?.textContent).toContain('Genograma sem título');
    expect(element.textContent).toContain('Nenhuma pessoa adicionada');
    expect(element.textContent).toContain('Adicionar pessoa');
    expect(element.querySelector('.skip-link')?.getAttribute('href')).toBe('#editor');
    expect(element.querySelector('#editor')).not.toBeNull();
  });
});

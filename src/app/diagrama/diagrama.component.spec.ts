import { TestBed } from '@angular/core/testing';
import { GenogramaService } from '../genograma/genograma.service';
import { DiagramaComponent } from './diagrama.component';

describe('DiagramaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DiagramaComponent] }).compileComponents();
  });

  it('deve refletir cadastro, edição, vínculo e remoção sem recarregar', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma pessoa adicionada');
    service.salvarPessoa({ id: 'a', nome: 'Ana', nascimento: '', falecida: false });
    service.salvarPessoa({ id: 'b', nome: 'Bruno', nascimento: '', falecida: false });
    service.adicionarVinculo('filiacao', 'a', 'b');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.person').length).toBe(2);
    expect(element.querySelectorAll('.connection').length).toBe(1);
    expect(element.querySelector('.connection')?.getAttribute('marker-end')).toBe('url(#seta-filiacao)');
    service.salvarPessoa({ id: 'a', nome: 'Ana Maria', nascimento: '', falecida: true });
    fixture.detectChanges();
    expect(element.querySelector('[data-pessoa-id="a"]')?.textContent).toContain('Ana Maria');
    expect(element.querySelector('[data-pessoa-id="a"]')?.textContent).toContain('Pessoa falecida');
    service.removerPessoa('b');
    fixture.detectChanges();
    expect(element.querySelectorAll('.person').length).toBe(1);
    expect(element.querySelectorAll('.connection').length).toBe(0);
  });

  it('deve refletir um genograma carregado e apresentar descrição textual e união tracejada', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    fixture.detectChanges();
    service.substituir([
      { id: 'a', nome: 'Ana', nascimento: '1980-02-03', falecida: false },
      { id: 'b', nome: 'Bruno', nascimento: '', falecida: false }
    ], [{ id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.connection.union')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('details').textContent).toContain('União: Ana e Bruno');
    expect(fixture.nativeElement.querySelector('details').textContent).toContain('03/02/1980');
  });

  it('deve limitar o zoom e permitir restaurar a escala inicial', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa({ id: 'a', nome: 'Ana', nascimento: '', falecida: false });
    const component = fixture.componentInstance;
    component.alterarZoom(-1000);
    expect(component.zoom()).toBe(50);
    component.alterarZoom(1000);
    fixture.detectChanges();
    expect(component.zoom()).toBe(150);
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent === 'Restaurar')!.click();
    expect(component.zoom()).toBe(100);
  });
  it('deve representar os símbolos e atualizar separação e divórcio na visualização', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa({ id: 'a', nome: 'A', nascimento: '', falecida: false, simbolo: 'quadrado' });
    service.salvarPessoa({ id: 'b', nome: 'B', nascimento: '', falecida: true, simbolo: 'circulo' });
    service.salvarPessoa({ id: 'c', nome: 'C', nascimento: '', falecida: false, simbolo: 'losango' });
    service.adicionarVinculo('uniao', 'a', 'b', 'separados');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-simbolo="quadrado"] rect')).not.toBeNull();
    expect(element.querySelector('[data-simbolo="circulo"] circle')).not.toBeNull();
    expect(element.querySelector('[data-simbolo="losango"] polygon')).not.toBeNull();
    expect(element.querySelector('[data-simbolo="circulo"] .deceased')).not.toBeNull();
    expect(element.querySelector('[data-situacao="separados"]')).not.toBeNull();
    service.alterarSituacaoUniao(service.vinculos()[0].id, 'divorciados');
    fixture.detectChanges();
    expect(element.querySelector('[data-situacao="divorciados"]')).not.toBeNull();
    expect(element.querySelector('details')?.textContent).toContain('Divórcio: A e B');
    expect(element.querySelector('details')?.textContent).toContain('símbolo: Quadrado');
  });
  it('deve distinguir adoção e acolhimento com setas e descrição textual', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b', 'c']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    service.adicionarVinculo('filiacao', 'a', 'b', undefined, 'adocao');
    service.adicionarVinculo('filiacao', 'a', 'c', undefined, 'acolhimento');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.connection.adoption').getAttribute('marker-end')).toBe('url(#seta-filiacao)');
    expect(fixture.nativeElement.querySelector('.connection.foster')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('details').textContent).toContain('Adoção: a é responsável por b');
    expect(fixture.nativeElement.querySelector('details').textContent).toContain('Acolhimento: a é responsável por c');
  });
  it('deve distinguir os vínculos emocionais sem setas e informar sua natureza no texto', () => {
    const fixture = TestBed.createComponent(DiagramaComponent);
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b', 'c', 'd']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    service.adicionarVinculo('emocional', 'a', 'b', undefined, undefined, 'proximidade');
    service.adicionarVinculo('emocional', 'b', 'c', undefined, undefined, 'conflito');
    service.adicionarVinculo('emocional', 'c', 'd', undefined, undefined, 'afastamento');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.connection.emotional').length).toBe(4);
    expect(element.querySelector('.connection.conflict')).not.toBeNull();
    expect(element.querySelector('.connection.distant')).not.toBeNull();
    expect(element.querySelector('.conflict-mark')).not.toBeNull();
    for (const path of element.querySelectorAll('.connection.emotional')) expect(path.getAttribute('marker-end')).toBeNull();
    expect(element.querySelector('details')?.textContent).toContain('Conflito: b e c');
  });
});

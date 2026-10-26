import { TestBed } from '@angular/core/testing';
import { GenogramaService } from '../genograma/genograma.service';
import { VinculosComponent } from './vinculos.component';

describe('VinculosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VinculosComponent] }).compileComponents();
  });

  it('deve orientar o cadastro quando faltarem pessoas', () => {
    const fixture = TestBed.createComponent(VinculosComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cadastre pelo menos duas pessoas');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('deve cadastrar pelo formulário, mostrar erros de duplicata e confirmar a remoção', () => {
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    const fixture = TestBed.createComponent(VinculosComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const selects = element.querySelectorAll('select');
    selects[1].value = 'a';
    selects[1].dispatchEvent(new Event('change'));
    selects[2].value = 'b';
    selects[2].dispatchEvent(new Event('change'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(service.vinculos().length).toBe(1);
    expect(element.textContent).toContain('Vínculo adicionado');

    component.formulario.patchValue({ origemId: 'b', destinoId: 'a' });
    component.salvar();
    fixture.detectChanges();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('já foi cadastrado');
    component.exclusaoId.set(service.vinculos()[0].id);
    fixture.detectChanges();
    expect(element.textContent).toContain('As duas pessoas continuarão cadastradas');
    expect(service.vinculos().length).toBe(1);
    component.excluir();
    fixture.detectChanges();
    expect(service.vinculos()).toEqual([]);
    expect(service.pessoas().length).toBe(2);
  });
  it('deve permitir atualizar a situação conjugal pela lista sem recriar a união', () => {
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    service.adicionarVinculo('uniao', 'a', 'b');
    const fixture = TestBed.createComponent(VinculosComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('li select') as HTMLSelectElement;
    const id = service.vinculos()[0].id;
    select.value = 'divorciados';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(service.vinculos().length).toBe(1);
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].situacao).toBe('divorciados');
    expect(fixture.nativeElement.textContent).toContain('a e b — divórcio');
  });
  it('deve cadastrar adoção pelo formulário e alterar para acolhimento na lista', () => {
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    const fixture = TestBed.createComponent(VinculosComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.formulario.patchValue({ tipo: 'filiacao', origemId: 'a', destinoId: 'b', modalidade: 'adocao' });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(service.vinculos()[0].modalidade).toBe('adocao');
    const id = service.vinculos()[0].id;
    const select = fixture.nativeElement.querySelector('li select') as HTMLSelectElement;
    select.value = 'acolhimento';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].modalidade).toBe('acolhimento');
    expect(fixture.nativeElement.textContent).toContain('a → b — acolhimento');
  });
  it('deve criar vínculo emocional e atualizar a relação pela lista preservando o identificador', () => {
    const service = TestBed.inject(GenogramaService);
    for (const id of ['a', 'b']) service.salvarPessoa({ id, nome: id, nascimento: '', falecida: false });
    const fixture = TestBed.createComponent(VinculosComponent);
    fixture.detectChanges();
    fixture.componentInstance.formulario.patchValue({ tipo: 'emocional', origemId: 'a', destinoId: 'b', relacao: 'proximidade' });
    fixture.componentInstance.salvar();
    fixture.detectChanges();
    const id = service.vinculos()[0].id;
    const select = fixture.nativeElement.querySelector('li select') as HTMLSelectElement;
    select.value = 'conflito';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].relacao).toBe('conflito');
    expect(fixture.nativeElement.textContent).toContain('a e b — conflito');
  });
});

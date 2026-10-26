import { TestBed } from '@angular/core/testing';
import { PessoasComponent } from './pessoas.component';

describe('PessoasComponent', () => {
  function criar() {
    const fixture = TestBed.createComponent(PessoasComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PessoasComponent] }).compileComponents();
  });

  it('deve impedir nomes vazios e mostrar a mensagem de validação', () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    component.novaPessoa();
    component.formulario.controls.nome.setValue('   ');
    component.salvar();
    fixture.detectChanges();

    expect(component.pessoas()).toEqual([]);
    expect(fixture.nativeElement.querySelector('#nome-erro').textContent).toContain('Informe o nome');
  });

  it('deve cadastrar pelo formulário e permitir nomes iguais com identificadores diferentes', () => {
    const fixture = criar();
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const input = element.querySelector('#nome') as HTMLInputElement;
    input.value = '  Ana  ';
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.novaPessoa();
    component.formulario.controls.nome.setValue('Ana');
    component.salvar();
    expect(component.pessoas().map(pessoa => pessoa.nome)).toEqual(['Ana', 'Ana']);
    expect(component.pessoas()[0].id).not.toBe(component.pessoas()[1].id);
  });

  it('deve preservar o identificador ao editar e descartar alterações ao cancelar', () => {
    const component = criar().componentInstance;
    component.novaPessoa();
    component.formulario.setValue({ nome: 'Ana', nascimento: '1980-02-03', falecida: false });
    component.salvar();
    const id = component.pessoas()[0].id;
    component.editar(component.pessoas()[0]);
    component.formulario.controls.nome.setValue('Maria');
    component.cancelar();
    expect(component.pessoas()[0].nome).toBe('Ana');

    component.editar(component.pessoas()[0]);
    component.formulario.patchValue({ nome: 'Ana Maria', falecida: true });
    component.salvar();
    expect(component.pessoas()).toEqual([{ id, nome: 'Ana Maria', nascimento: '1980-02-03', falecida: true }]);
  });

  it('deve remover somente a pessoa confirmada e retornar ao estado vazio', () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    component.novaPessoa();
    component.formulario.controls.nome.setValue('Ana');
    component.salvar();
    component.solicitarExclusao(component.pessoas()[0]);
    expect(component.pessoas().length).toBe(1);
    component.exclusaoId.set(null);
    component.excluir();
    expect(component.pessoas().length).toBe(1);
    component.solicitarExclusao(component.pessoas()[0]);
    component.excluir();
    fixture.detectChanges();
    expect(component.pessoas()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Adicione a primeira pessoa');
  });
});

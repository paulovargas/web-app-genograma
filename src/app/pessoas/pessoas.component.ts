import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pessoa } from './pessoa.model';

@Component({
  selector: 'app-pessoas',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.css'
})
export class PessoasComponent {
  readonly pessoas = signal<readonly Pessoa[]>([]);
  readonly formularioAberto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly exclusaoId = signal<string | null>(null);
  readonly mensagem = signal('');
  readonly pessoaParaExcluir = computed(() => this.pessoas().find(pessoa => pessoa.id === this.exclusaoId()));
  readonly formulario = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    nascimento: new FormControl('', { nonNullable: true }),
    falecida: new FormControl(false, { nonNullable: true })
  });

  novaPessoa(): void {
    this.cancelar();
    this.mensagem.set('');
    this.formularioAberto.set(true);
  }

  editar(pessoa: Pessoa): void {
    this.exclusaoId.set(null);
    this.mensagem.set('');
    this.editandoId.set(pessoa.id);
    this.formulario.reset({ nome: pessoa.nome, nascimento: pessoa.nascimento, falecida: pessoa.falecida });
    this.formularioAberto.set(true);
  }

  salvar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const dados = this.formulario.getRawValue();
    const editandoId = this.editandoId();
    const pessoa: Pessoa = { ...dados, nome: dados.nome.trim(), id: editandoId ?? crypto.randomUUID() };
    this.pessoas.update(pessoas => editandoId
      ? pessoas.map(atual => atual.id === editandoId ? pessoa : atual)
      : [...pessoas, pessoa]);
    this.cancelar();
    this.mensagem.set(editandoId ? 'Pessoa atualizada.' : 'Pessoa adicionada.');
  }

  cancelar(): void {
    this.formulario.reset();
    this.formularioAberto.set(false);
    this.editandoId.set(null);
  }

  solicitarExclusao(pessoa: Pessoa): void {
    this.cancelar();
    this.mensagem.set('');
    this.exclusaoId.set(pessoa.id);
  }

  excluir(): void {
    const id = this.exclusaoId();
    if (!id) return;
    this.pessoas.update(pessoas => pessoas.filter(pessoa => pessoa.id !== id));
    this.exclusaoId.set(null);
    this.mensagem.set('Pessoa removida.');
  }
}

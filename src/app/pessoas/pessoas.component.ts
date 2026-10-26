import { RascunhoService } from '../recuperacao/rascunho.service';
import { FormularioPessoaLocal } from '../recuperacao/rascunho-local.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenogramaService } from '../genograma/genograma.service';
import { Pessoa, SimboloPessoa } from './pessoa.model';

@Component({
  selector: 'app-pessoas',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.css'
})
export class PessoasComponent {
  private readonly rascunhoLocal = inject(RascunhoService);
  private primeiraSessao = true;
  readonly genograma = inject(GenogramaService);
  readonly pessoas = this.genograma.pessoas;
  readonly formularioAberto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly exclusaoId = signal<string | null>(null);
  readonly mensagem = signal('');
  readonly pessoaParaExcluir = computed(() => this.pessoas().find(pessoa => pessoa.id === this.exclusaoId()));
  readonly vinculosParaExcluir = computed(() => this.genograma.vinculosDaPessoa(this.exclusaoId() ?? ''));
  readonly formulario = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    nascimento: new FormControl('', { nonNullable: true }),
    simbolo: new FormControl<SimboloPessoa>('neutro', { nonNullable: true }),
    falecida: new FormControl(false, { nonNullable: true })
  });

  private readonly eventosFormulario = toSignal(this.formulario.events);
  readonly rascunhoPendente = computed(() => {
    this.eventosFormulario();
    return this.formularioAberto() && this.formulario.dirty;
  });

  constructor() {
    effect(() => {
      this.genograma.sessao();
      this.cancelar();
      this.exclusaoId.set(null);
      this.mensagem.set('');
      if (this.primeiraSessao) {
        this.primeiraSessao = false;
        const local = this.rascunhoLocal.recuperado?.pessoa;
        if (local) {
          this.formulario.reset(local.dados);
          this.editandoId.set(local.editandoId);
          this.formularioAberto.set(true);
          if (local.sujo) this.formulario.markAsDirty();
        }
      }
    });
  }

  capturarRascunho(): FormularioPessoaLocal | null {
    this.eventosFormulario();
    return this.formularioAberto() ? { editandoId: this.editandoId(), sujo: this.formulario.dirty, dados: this.formulario.getRawValue() } : null;
  }

  novaPessoa(): void {
    this.exclusaoId.set(null);
    this.cancelar();
    this.mensagem.set('');
    this.formularioAberto.set(true);
  }

  editar(pessoa: Pessoa): void {
    this.exclusaoId.set(null);
    this.mensagem.set('');
    this.editandoId.set(pessoa.id);
    this.formulario.reset({ nome: pessoa.nome, nascimento: pessoa.nascimento, falecida: pessoa.falecida, simbolo: pessoa.simbolo ?? 'neutro' });
    this.formularioAberto.set(true);
  }

  salvar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const { simbolo, ...dados } = this.formulario.getRawValue();
    const editandoId = this.editandoId();
    const pessoa: Pessoa = { ...dados, ...(simbolo !== 'neutro' ? { simbolo } : {}), nome: dados.nome.trim(), id: editandoId ?? crypto.randomUUID() };
    this.genograma.salvarPessoa(pessoa);
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
    this.genograma.removerPessoa(id);
    this.exclusaoId.set(null);
    this.mensagem.set('Pessoa removida.');
  }
}

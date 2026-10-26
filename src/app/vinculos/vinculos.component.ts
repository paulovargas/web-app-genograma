import { RascunhoService } from '../recuperacao/rascunho.service';
import { FormularioVinculoLocal } from '../recuperacao/rascunho-local.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenogramaService } from '../genograma/genograma.service';
import { RelacaoEmocional, ROTULOS_EMOCIONAIS, ModalidadeFiliacao, ROTULOS_FILIACAO, ROTULOS_CONJUGAIS, SituacaoConjugal, TipoVinculo, Vinculo } from './vinculo.model';

@Component({
  selector: 'app-vinculos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vinculos.component.html',
  styleUrl: './vinculos.component.css'
})
export class VinculosComponent {
  private readonly rascunhoLocal = inject(RascunhoService);
  private primeiraSessao = true;
  readonly genograma = inject(GenogramaService);
  readonly erro = signal('');
  readonly mensagem = signal('');
  readonly exclusaoId = signal<string | null>(null);
  readonly vinculoParaExcluir = computed(() => this.genograma.vinculos().find(vinculo => vinculo.id === this.exclusaoId()));
  readonly formulario = new FormGroup({
    relacao: new FormControl<RelacaoEmocional>('proximidade', { nonNullable: true }),
    modalidade: new FormControl<ModalidadeFiliacao>('nao_informada', { nonNullable: true }),
    situacao: new FormControl<SituacaoConjugal>('juntos', { nonNullable: true }),
    tipo: new FormControl<TipoVinculo>('uniao', { nonNullable: true }),
    origemId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    destinoId: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  private readonly eventosFormulario = toSignal(this.formulario.events);
  readonly rascunhoPendente = computed(() => {
    this.eventosFormulario();
    return this.formulario.dirty;
  });

  cancelar(): void {
    this.formulario.reset();
    this.erro.set('');
  }

  constructor() {
    effect(() => {
      this.genograma.sessao();
      this.formulario.reset();
      this.exclusaoId.set(null);
      this.erro.set('');
      this.mensagem.set('');
      if (this.primeiraSessao) {
        this.primeiraSessao = false;
        const local = this.rascunhoLocal.recuperado?.vinculo;
        if (local) {
          this.formulario.reset(local.dados);
          if (local.sujo) this.formulario.markAsDirty();
        }
      }
    });
  }

  capturarRascunho(): FormularioVinculoLocal {
    this.eventosFormulario();
    return { sujo: this.formulario.dirty, dados: this.formulario.getRawValue() };
  }

  salvar(): void {
    this.mensagem.set('');
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.erro.set('Selecione as duas pessoas para criar o vínculo.');
      return;
    }
    const { tipo, origemId, destinoId, situacao, modalidade, relacao } = this.formulario.getRawValue();
    const erro = this.genograma.adicionarVinculo(tipo, origemId, destinoId, tipo === 'uniao' ? situacao : undefined, tipo === 'filiacao' ? modalidade : undefined, tipo === 'emocional' ? relacao : undefined);
    this.erro.set(erro ?? '');
    if (erro) return;
    this.formulario.reset({ tipo, situacao, modalidade, relacao, origemId: '', destinoId: '' });
    this.mensagem.set('Vínculo adicionado.');
  }

  nomePessoa(id: string): string {
    return this.genograma.pessoas().find(pessoa => pessoa.id === id)?.nome ?? 'Pessoa removida';
  }

  descricao(vinculo: Vinculo): string {
    const origem = this.nomePessoa(vinculo.origemId);
    const destino = this.nomePessoa(vinculo.destinoId);
    if (vinculo.tipo === 'emocional') return [origem, destino].join(' e ') + ' — ' + ROTULOS_EMOCIONAIS[vinculo.relacao!].toLowerCase();
    return vinculo.tipo === 'uniao' ? `${origem} e ${destino} — ${ROTULOS_CONJUGAIS[vinculo.situacao ?? 'juntos'].toLowerCase()}` : `${origem} → ${destino} — ${ROTULOS_FILIACAO[vinculo.modalidade ?? 'nao_informada'].toLowerCase()}`;
  }

  alterarSituacao(vinculo: Vinculo, evento: Event): void {
    const situacao = (evento.target as HTMLSelectElement).value as SituacaoConjugal;
    const erro = this.genograma.alterarSituacaoUniao(vinculo.id, situacao);
    this.erro.set(erro ?? '');
    this.mensagem.set(erro ? '' : 'Situação conjugal atualizada. Salve o genograma para guardar a alteração.');
  }

  alterarModalidade(vinculo: Vinculo, evento: Event): void {
    const modalidade = (evento.target as HTMLSelectElement).value as ModalidadeFiliacao;
    const erro = this.genograma.alterarModalidadeFiliacao(vinculo.id, modalidade);
    this.erro.set(erro ?? '');
    this.mensagem.set(erro ? '' : 'Modalidade atualizada. Salve o genograma para guardar a alteração.');
  }
  alterarRelacao(vinculo: Vinculo, evento: Event): void {
    const relacao = (evento.target as HTMLSelectElement).value as RelacaoEmocional;
    const erro = this.genograma.alterarRelacaoEmocional(vinculo.id, relacao);
    this.erro.set(erro ?? '');
    this.mensagem.set(erro ? '' : 'Relação emocional atualizada. Salve o genograma para guardar a alteração.');
  }
  excluir(): void {
    const id = this.exclusaoId();
    if (!id) return;
    this.genograma.removerVinculo(id);
    this.exclusaoId.set(null);
    this.mensagem.set('Vínculo removido.');
    this.erro.set('');
  }
}

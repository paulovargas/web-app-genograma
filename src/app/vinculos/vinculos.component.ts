import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenogramaService } from '../genograma/genograma.service';
import { TipoVinculo, Vinculo } from './vinculo.model';

@Component({
  selector: 'app-vinculos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vinculos.component.html',
  styleUrl: './vinculos.component.css'
})
export class VinculosComponent {
  readonly genograma = inject(GenogramaService);
  readonly erro = signal('');
  readonly mensagem = signal('');
  readonly exclusaoId = signal<string | null>(null);
  readonly vinculoParaExcluir = computed(() => this.genograma.vinculos().find(vinculo => vinculo.id === this.exclusaoId()));
  readonly formulario = new FormGroup({
    tipo: new FormControl<TipoVinculo>('uniao', { nonNullable: true }),
    origemId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    destinoId: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  salvar(): void {
    this.mensagem.set('');
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.erro.set('Selecione as duas pessoas para criar o vínculo.');
      return;
    }
    const { tipo, origemId, destinoId } = this.formulario.getRawValue();
    const erro = this.genograma.adicionarVinculo(tipo, origemId, destinoId);
    this.erro.set(erro ?? '');
    if (erro) return;
    this.formulario.reset({ tipo, origemId: '', destinoId: '' });
    this.mensagem.set('Vínculo adicionado.');
  }

  nomePessoa(id: string): string {
    return this.genograma.pessoas().find(pessoa => pessoa.id === id)?.nome ?? 'Pessoa removida';
  }

  descricao(vinculo: Vinculo): string {
    const origem = this.nomePessoa(vinculo.origemId);
    const destino = this.nomePessoa(vinculo.destinoId);
    return vinculo.tipo === 'uniao' ? `${origem} e ${destino} — união` : `${origem} → ${destino} — responsável e descendente`;
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

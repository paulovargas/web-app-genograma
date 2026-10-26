import { Injectable, signal } from '@angular/core';
import { Pessoa } from '../pessoas/pessoa.model';
import { TipoVinculo, Vinculo } from '../vinculos/vinculo.model';

@Injectable({ providedIn: 'root' })
export class GenogramaService {
  private readonly pessoasEstado = signal<readonly Pessoa[]>([]);
  private readonly vinculosEstado = signal<readonly Vinculo[]>([]);
  private readonly sessaoEstado = signal(0);
  readonly sessao = this.sessaoEstado.asReadonly();
  readonly pessoas = this.pessoasEstado.asReadonly();
  readonly vinculos = this.vinculosEstado.asReadonly();

  substituir(pessoas: readonly Pessoa[], vinculos: readonly Vinculo[]): void {
    this.pessoasEstado.set(pessoas);
    this.vinculosEstado.set(vinculos);
    this.sessaoEstado.update(sessao => sessao + 1);
  }

  salvarPessoa(pessoa: Pessoa): void {
    this.pessoasEstado.update(pessoas => pessoas.some(atual => atual.id === pessoa.id)
      ? pessoas.map(atual => atual.id === pessoa.id ? pessoa : atual)
      : [...pessoas, pessoa]);
  }

  vinculosDaPessoa(id: string): readonly Vinculo[] {
    return this.vinculos().filter(vinculo => vinculo.origemId === id || vinculo.destinoId === id);
  }

  removerPessoa(id: string): void {
    this.vinculosEstado.update(vinculos => vinculos.filter(vinculo => vinculo.origemId !== id && vinculo.destinoId !== id));
    this.pessoasEstado.update(pessoas => pessoas.filter(pessoa => pessoa.id !== id));
  }

  adicionarVinculo(tipo: TipoVinculo, origemId: string, destinoId: string): string | null {
    if (tipo !== 'uniao' && tipo !== 'filiacao') return 'Selecione um tipo de vínculo válido.';
    if (!this.pessoas().some(pessoa => pessoa.id === origemId) || !this.pessoas().some(pessoa => pessoa.id === destinoId)) {
      return 'Selecione duas pessoas cadastradas.';
    }
    if (origemId === destinoId) return 'Selecione pessoas diferentes.';

    const duplicado = this.vinculos().some(vinculo => vinculo.tipo === tipo && (
      (vinculo.origemId === origemId && vinculo.destinoId === destinoId) ||
      (tipo === 'uniao' && vinculo.origemId === destinoId && vinculo.destinoId === origemId)
    ));
    if (duplicado) return 'Este vínculo já foi cadastrado.';
    if (tipo === 'filiacao' && this.alcancaDescendente(destinoId, origemId)) {
      return 'Esta filiação criaria um ciclo de ancestralidade.';
    }

    this.vinculosEstado.update(vinculos => [...vinculos, { id: crypto.randomUUID(), tipo, origemId, destinoId }]);
    return null;
  }

  removerVinculo(id: string): void {
    this.vinculosEstado.update(vinculos => vinculos.filter(vinculo => vinculo.id !== id));
  }

  private alcancaDescendente(inicioId: string, procuradoId: string): boolean {
    const pendentes = [inicioId];
    const visitados = new Set<string>();
    const filiacoes = this.vinculos().filter(vinculo => vinculo.tipo === 'filiacao');
    while (pendentes.length > 0) {
      const id = pendentes.pop()!;
      if (id === procuradoId) return true;
      if (visitados.has(id)) continue;
      visitados.add(id);
      for (const vinculo of filiacoes) {
        if (vinculo.origemId === id) pendentes.push(vinculo.destinoId);
      }
    }
    return false;
  }
}

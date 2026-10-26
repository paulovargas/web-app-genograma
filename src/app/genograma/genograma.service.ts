import { Injectable, signal } from '@angular/core';
import { Pessoa } from '../pessoas/pessoa.model';
import { ModalidadeFiliacao, MODALIDADES_FILIACAO, SituacaoConjugal, SITUACOES_CONJUGAIS, TipoVinculo, Vinculo } from '../vinculos/vinculo.model';

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

  adicionarVinculo(tipo: TipoVinculo, origemId: string, destinoId: string, situacao?: SituacaoConjugal, modalidade?: ModalidadeFiliacao): string | null {
    if (modalidade !== undefined && (tipo !== 'filiacao' || !MODALIDADES_FILIACAO.includes(modalidade))) {
      return 'Selecione uma modalidade válida para o vínculo de filiação ou cuidado.';
    }
    if (situacao !== undefined && (tipo !== 'uniao' || !SITUACOES_CONJUGAIS.includes(situacao))) {
      return 'Selecione uma situação conjugal válida para a união.';
    }
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
      return 'Este vínculo criaria um ciclo entre responsáveis e pessoas vinculadas.';
    }

    this.vinculosEstado.update(vinculos => [...vinculos, { id: crypto.randomUUID(), tipo, origemId, destinoId, ...(situacao ? { situacao } : {}), ...(modalidade ? { modalidade } : {}) }]);
    return null;
  }

  alterarSituacaoUniao(id: string, situacao: SituacaoConjugal): string | null {
    if (!SITUACOES_CONJUGAIS.includes(situacao)) return 'Situação conjugal inválida.';
    if (!this.vinculos().some(vinculo => vinculo.id === id && vinculo.tipo === 'uniao')) {
      return 'A união não foi encontrada.';
    }
    this.vinculosEstado.update(vinculos => vinculos.map(vinculo => vinculo.id === id ? { ...vinculo, situacao } : vinculo));
    return null;
  }

  alterarModalidadeFiliacao(id: string, modalidade: ModalidadeFiliacao): string | null {
    if (!MODALIDADES_FILIACAO.includes(modalidade)) return 'Modalidade inválida.';
    if (!this.vinculos().some(vinculo => vinculo.id === id && vinculo.tipo === 'filiacao')) {
      return 'O vínculo de filiação ou cuidado não foi encontrado.';
    }
    this.vinculosEstado.update(vinculos => vinculos.map(vinculo => vinculo.id === id ? { ...vinculo, modalidade } : vinculo));
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

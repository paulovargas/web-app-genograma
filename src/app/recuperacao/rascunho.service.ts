import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { RascunhoLocal, validarRascunho } from './rascunho-local.model';

export type ArmazenamentoLocal = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const RASCUNHO_CHAVE = 'genograma.rascunho.v1';
export const RASCUNHO_STORAGE = new InjectionToken<ArmazenamentoLocal | null>('RASCUNHO_STORAGE', {
  providedIn: 'root', factory: () => { try { return window.localStorage; } catch { return null; } }
});

@Injectable({ providedIn: 'root' })
export class RascunhoService {
  private readonly storage = inject(RASCUNHO_STORAGE);
  private bloqueado = false;
  private ultimaGravacao: string | null = null;
  private ultimaPendente: boolean | null = null;
  recuperado: RascunhoLocal | null = null;
  readonly revisao = signal(0);
  readonly erro = signal('');
  readonly invalido = signal(false);
  readonly protegido = signal(false);
  readonly restaurado = signal(false);

  ler(): RascunhoLocal | null {
    this.recuperado = null;
    if (!this.storage) { this.erro.set('A recuperação automática não está disponível neste navegador.'); return null; }
    let texto: string | null;
    try { texto = this.storage.getItem(RASCUNHO_CHAVE); }
    catch { this.bloqueado = true; this.erro.set('Não foi possível ler a cópia local. Ela não será sobrescrita nesta sessão.'); return null; }
    if (texto === null) return null;
    try {
      this.recuperado = validarRascunho(JSON.parse(texto));
      this.ultimaGravacao = texto;
      this.protegido.set(true);
      this.restaurado.set(true);
      return this.recuperado;
    } catch {
      this.bloqueado = true;
      this.invalido.set(true);
      this.erro.set('A cópia local não pôde ser recuperada. Ela foi preservada e não substituirá o editor.');
      return null;
    }
  }

  guardar(dados: Omit<RascunhoLocal, 'versao' | 'atualizadoEm'>, pendente: boolean): void {
    if (this.bloqueado) return;
    if (!this.storage) { this.erro.set('A recuperação automática não está disponível. Use Salvar genograma para guardar na API.'); return; }
    const conteudo = JSON.stringify(dados);
    if (conteudo === this.ultimaGravacao && pendente === this.ultimaPendente) return;
    try {
      if (pendente) this.storage.setItem(RASCUNHO_CHAVE, JSON.stringify({ ...dados, versao: 1, atualizadoEm: new Date().toISOString() }));
      else this.storage.removeItem(RASCUNHO_CHAVE);
      this.ultimaGravacao = conteudo;
      this.ultimaPendente = pendente;
      this.protegido.set(pendente);
      this.erro.set('');
    } catch {
      this.protegido.set(false);
      this.erro.set('Não foi possível atualizar a cópia local. Seus dados continuam no editor; salve o genograma na API.');
    }
  }

  descartarInvalido(): void {
    try {
      if (!this.storage) throw new Error('Sem armazenamento');
      this.storage.removeItem(RASCUNHO_CHAVE);
      this.bloqueado = false;
      this.ultimaGravacao = null;
      this.ultimaPendente = null;
      this.invalido.set(false);
      this.revisao.update(revisao => revisao + 1);
      this.erro.set('');
    } catch { this.erro.set('Não foi possível descartar a cópia local.'); }
  }
}

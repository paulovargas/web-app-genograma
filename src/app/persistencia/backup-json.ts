import { DadosGenograma } from './genograma.model';
import { copiarDados, validarGenograma } from './validar-genograma';

export const LIMITE_BACKUP_JSON = 5 * 1024 * 1024;

export function criarBackupJson(dados: DadosGenograma): string {
  const validado = validarGenograma({ ...dados, id: 'arquivo' });
  const texto = JSON.stringify({ formato: 'genograma', versao: 1, exportadoEm: new Date().toISOString(), genograma: copiarDados(validado) }, null, 2) + '\n';
  if (new Blob([texto]).size > LIMITE_BACKUP_JSON) throw new Error('O backup ultrapassa o limite de 5 MiB.');
  return texto;
}

export function lerBackupJson(texto: string): DadosGenograma {
  let valor: unknown;
  try { valor = JSON.parse(texto.replace(/^\uFEFF/, '')); }
  catch { throw new Error('O arquivo não contém um JSON válido.'); }
  if (typeof valor !== 'object' || valor === null) throw new Error('Formato de backup inválido.');
  const backup = valor as Record<string, unknown>;
  if (backup['formato'] !== 'genograma' || backup['versao'] !== 1) {
    throw new Error('Formato ou versão de backup não suportado. Use um JSON exportado por este aplicativo.');
  }
  if (typeof backup['genograma'] !== 'object' || backup['genograma'] === null) throw new Error('O arquivo não contém um genograma válido.');
  // O identificador remoto nunca é transportado: importar sempre inicia uma cópia nova.
  return copiarDados(validarGenograma({ ...backup['genograma'], id: 'arquivo' }));
}

export function nomeBackupJson(titulo: string): string {
  const nome = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return `genograma-${nome || 'sem-titulo'}.json`;
}

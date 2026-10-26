import { Pessoa } from '../pessoas/pessoa.model';
import { ROTULOS_CONJUGAIS, Vinculo } from '../vinculos/vinculo.model';

export interface PessoaNo {
  readonly pessoa: Pessoa;
  readonly x: number;
  readonly y: number;
  readonly linhasNome: readonly string[];
}

export interface Conexao {
  readonly vinculo: Vinculo;
  readonly caminho: string;
  readonly descricao: string;
  readonly marcacao?: { readonly x: number; readonly y: number };
}

export interface Diagrama {
  readonly pessoas: readonly PessoaNo[];
  readonly conexoes: readonly Conexao[];
  readonly largura: number;
  readonly altura: number;
}

export const LARGURA_CARTAO = 160;
export const ALTURA_CARTAO = 100;

function linhasDoNome(nome: string, limite = 21): readonly string[] {
  const caracteres = Array.from(nome);
  if (caracteres.length <= limite) return [nome];
  const primeira = caracteres.slice(0, limite).join('');
  const restante = caracteres.slice(limite);
  return [primeira, restante.length > limite ? restante.slice(0, limite - 1).join('') + '…' : restante.join('')];
}

export function construirDiagrama(pessoas: readonly Pessoa[], vinculos: readonly Vinculo[]): Diagrama {
  const ids = new Set(pessoas.map(pessoa => pessoa.id));
  const validos = vinculos.filter(vinculo => ids.has(vinculo.origemId) && ids.has(vinculo.destinoId));
  const filiacoes = validos.filter(vinculo => vinculo.tipo === 'filiacao');
  const graus = new Map(pessoas.map(pessoa => [pessoa.id, 0]));
  const niveis = new Map(pessoas.map(pessoa => [pessoa.id, 0]));
  const descendentes = new Map<string, string[]>();
  for (const vinculo of filiacoes) {
    graus.set(vinculo.destinoId, graus.get(vinculo.destinoId)! + 1);
    const filhos = descendentes.get(vinculo.origemId) ?? [];
    filhos.push(vinculo.destinoId);
    descendentes.set(vinculo.origemId, filhos);
  }

  // O maior caminho de filiação mantém cada descendente abaixo de todos os responsáveis.
  const fila = pessoas.filter(pessoa => graus.get(pessoa.id) === 0).map(pessoa => pessoa.id);
  for (let indice = 0; indice < fila.length; indice++) {
    const id = fila[indice];
    for (const descendente of descendentes.get(id) ?? []) {
      niveis.set(descendente, Math.max(niveis.get(descendente)!, niveis.get(id)! + 1));
      graus.set(descendente, graus.get(descendente)! - 1);
      if (graus.get(descendente) === 0) fila.push(descendente);
    }
  }

  const linhas = new Map<number, Pessoa[]>();
  for (const pessoa of pessoas) {
    const nivel = niveis.get(pessoa.id)!;
    const linha = linhas.get(nivel) ?? [];
    linha.push(pessoa);
    linhas.set(nivel, linha);
  }
  const maiorLinha = Math.max(1, ...Array.from(linhas.values(), linha => linha.length));
  const largura = Math.max(640, maiorLinha * 210 + 60);
  const altura = Math.max(360, linhas.size * 210 + 50);
  const nos: PessoaNo[] = [];
  for (const [nivel, linha] of linhas) {
    const inicio = (largura - (linha.length - 1) * 210 - LARGURA_CARTAO) / 2;
    linha.forEach((pessoa, indice) => nos.push({ pessoa, x: inicio + indice * 210, y: 55 + nivel * 210, linhasNome: linhasDoNome(pessoa.nome, pessoa.simbolo && pessoa.simbolo !== 'neutro' ? 15 : 21) }));
  }
  const porId = new Map(nos.map(no => [no.pessoa.id, no]));
  const conexoes = validos.map(vinculo => {
    const origem = porId.get(vinculo.origemId)!;
    const destino = porId.get(vinculo.destinoId)!;
    let caminho: string;
    let marcacao: { x: number; y: number } | undefined;
    if (vinculo.tipo === 'filiacao') {
      const x1 = origem.x + LARGURA_CARTAO / 2;
      const y1 = origem.y + ALTURA_CARTAO;
      const x2 = destino.x + LARGURA_CARTAO / 2;
      const y2 = destino.y - 5;
      const meio = (y1 + y2) / 2;
      caminho = `M ${x1} ${y1} V ${meio} H ${x2} V ${y2}`;
    } else if (origem.y === destino.y) {
      const esquerda = origem.x < destino.x ? origem : destino;
      const direita = origem.x < destino.x ? destino : origem;
      const x1 = esquerda.x + LARGURA_CARTAO / 2;
      const x2 = direita.x + LARGURA_CARTAO / 2;
      const topo = origem.y - 30;
      caminho = `M ${x1} ${origem.y} V ${topo} H ${x2} V ${destino.y}`;
      marcacao = { x: (x1 + x2) / 2, y: topo };
    } else {
      const x1 = origem.x + LARGURA_CARTAO;
      const x2 = destino.x + LARGURA_CARTAO;
      const lado = Math.max(x1, x2) + 25;
      caminho = `M ${x1} ${origem.y + 30} H ${lado} V ${destino.y + 30} H ${x2}`;
      marcacao = { x: lado, y: (origem.y + destino.y) / 2 + 30 };
    }
    return {
      vinculo, caminho, marcacao,
      descricao: vinculo.tipo === 'uniao'
        ? `${ROTULOS_CONJUGAIS[vinculo.situacao ?? 'juntos']}: ${origem.pessoa.nome} e ${destino.pessoa.nome}`
        : `Filiação: ${origem.pessoa.nome} é responsável por ${destino.pessoa.nome}`
    };
  });
  return { pessoas: nos, conexoes, largura, altura };
}

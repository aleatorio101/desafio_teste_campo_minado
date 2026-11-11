import { expect, test } from "@jest/globals";
import bombas from '../fixtures/bombas.json' with { type: 'json' };
import { criarJogo, executarAcao, obterVisao, agir, proibir, visao } from './apoio.js';
const novo = () => criarJogo({
  bombas: structuredClone(bombas)
});
test('CM01 — criação exata, bombas fixas e casas inicialmente fechadas', () => {
  const opcoes = {
    bombas: structuredClone(bombas)
  };
  const antes = structuredClone(opcoes);
  const e = criarJogo(opcoes);
  expect(opcoes).toEqual(antes);
  expect(e.linhas).toBe(14);
  expect(e.colunas).toBe(18);
  expect(e.totalBombas).toBe(40);
  expect(e.tabuleiro.length).toBe(14);
  expect(e.tabuleiro.flat().length).toBe(252);
  expect(e.reveladas).toBe(0);
  expect(e.status).toBe('em_andamento');
  expect(e.tabuleiro.flat().filter(c => c.bomba).length).toBe(40);
  for (const linha of e.tabuleiro) {
    expect(linha.length).toBe(18);
    for (const c of linha) {
      expect(c.aberta).toBe(false);
      expect(c.bandeira).toBe(false);
    }
  }
  expect(e.tabuleiro[2][3].bomba).toBe(true);
  expect(e.tabuleiro[2][4].bomba).toBe(false);
  opcoes.bombas[0].coluna = 17;
  expect(e.tabuleiro[0][0].bomba).toBe(true);
});
for (const [linha, coluna, numero] of [[0, 0, 3], [0, 17, 3], [1, 0, 5], [1, 2, 8], [1, 17, 3], [2, 4, 4], [2, 17, 2], [3, 0, 2], [3, 3, 2], [3, 4, 1], [3, 5, 0], [13, 0, 0], [13, 17, 0]]) {
  test(`CM02 — vizinhas (${linha},${coluna}) = ${numero}`, () => {
    expect(novo().tabuleiro[linha][coluna].vizinhas).toBe(numero);
  });
}
test('CM03 — abrir número revela somente aquela casa', () => {
  const e = agir(novo(), {
    tipo: 'abrir',
    linha: 2,
    coluna: 4
  });
  expect(e.reveladas).toBe(1);
  expect(e.tabuleiro[2][4].aberta).toBe(true);
  expect(e.tabuleiro[2][5].aberta).toBe(false);
  expect(e.status).toBe('em_andamento');
  expect(visao(e, 0).tabuleiro[2][4]).toEqual({
    aberta: true,
    bandeira: false,
    conteudo: 4
  });
});
test('CM04 — expansão revela todas as 212 seguras e vence sem bandeiras', () => {
  const e = agir(novo(), {
    tipo: 'abrir',
    linha: 13,
    coluna: 17
  });
  expect(e.reveladas).toBe(212);
  expect(e.status).toBe('vitoria');
  expect(e.tabuleiro.flat().filter(c => c.aberta).length).toBe(212);
  expect(e.tabuleiro.flat().filter(c => c.aberta && c.bomba).length).toBe(0);
  expect(e.tabuleiro[2][4].aberta).toBe(true);
  expect(e.tabuleiro[3][0].aberta).toBe(true);
});
test('CM05 — bandeira pode ser colocada e retirada', () => {
  const e = agir(novo(), {
    tipo: 'alternar_bandeira',
    linha: 0,
    coluna: 0
  });
  expect(e.tabuleiro[0][0].bandeira).toBe(true);
  expect(visao(e, 0).tabuleiro[0][0]).toEqual({
    aberta: false,
    bandeira: true,
    conteudo: null
  });
  const f = agir(e, {
    tipo: 'alternar_bandeira',
    linha: 0,
    coluna: 0
  });
  expect(f.tabuleiro[0][0].bandeira).toBe(false);
  expect(f.reveladas).toBe(0);
});
test('CM06 — expansão respeita bandeira em casa segura', () => {
  let e = agir(novo(), {
    tipo: 'alternar_bandeira',
    linha: 13,
    coluna: 17
  });
  proibir(e, {
    tipo: 'abrir',
    linha: 13,
    coluna: 17
  }, 'CASA_MARCADA');
  e = agir(e, {
    tipo: 'abrir',
    linha: 13,
    coluna: 0
  });
  expect(e.reveladas).toBe(211);
  expect(e.status).toBe('em_andamento');
  expect(e.tabuleiro[13][17].aberta).toBe(false);
  e = agir(e, {
    tipo: 'alternar_bandeira',
    linha: 13,
    coluna: 17
  });
  e = agir(e, {
    tipo: 'abrir',
    linha: 13,
    coluna: 17
  });
  expect(e.reveladas).toBe(212);
  expect(e.status).toBe('vitoria');
});
test('CM07 — bomba no primeiro clique causa derrota, sem reposicionamento', () => {
  const e = agir(novo(), {
    tipo: 'abrir',
    linha: 0,
    coluna: 0
  });
  expect(e.status).toBe('derrota');
  expect(e.reveladas).toBe(0);
  expect(e.tabuleiro[0][0].aberta).toBe(true);
  expect(visao(e, 0).tabuleiro[1][17].conteudo).toBe('bomba');
  expect(visao(e, 0).tabuleiro[1][17].aberta).toBe(false);
});
test('CM08 — visão inicial não revela localização ou vizinhança de bombas', () => {
  const e = novo();
  const v = visao(e, 0);
  expect(Object.keys(v).sort()).toEqual(['reveladas', 'status', 'tabuleiro']);
  for (const c of v.tabuleiro.flat()) expect(c).toEqual({
    aberta: false,
    bandeira: false,
    conteudo: null
  });
  v.tabuleiro[0][0].aberta = true;
  expect(e.tabuleiro[0][0].aberta).toBe(false);
});
for (const tipo of ['abrir', 'alternar_bandeira']) {
  test(`CM09 — ${tipo} rejeita casa aberta`, () => {
    const e = agir(novo(), {
      tipo: 'abrir',
      linha: 2,
      coluna: 4
    });
    proibir(e, {
      tipo,
      linha: 2,
      coluna: 4
    }, 'CASA_ABERTA');
  });
  for (const [linha, coluna] of [[-1, 0], [14, 0], [0, -1], [0, 18]]) {
    test(`CM10 — ${tipo} fora do tabuleiro (${linha},${coluna})`, () => {
      expect(() => executarAcao(novo(), {
        tipo,
        linha,
        coluna
      })).toThrow(RangeError);
    });
  }
  for (const linha of ['0', 0.5, null]) {
    test(`CM11 — ${tipo} exige coordenadas inteiras: ${linha}`, () => {
      expect(() => executarAcao(novo(), {
        tipo,
        linha,
        coluna: 0
      })).toThrow(TypeError);
    });
  }
  for (const [linha, coluna] of [[0, 0], [13, 17]]) {
    test(`CM12 — ${tipo} é proibida depois de encerrar em (${linha},${coluna})`, () => {
      const e = agir(novo(), {
        tipo: 'abrir',
        linha,
        coluna
      });
      proibir(e, {
        tipo,
        linha: 5,
        coluna: 5
      }, 'JOGO_ENCERRADO');
    });
  }
}
test('CM13 — validar preparação das bombas', () => {
  expect(() => criarJogo({
    bombas: bombas.slice(1)
  })).toThrow(RangeError);
  const duplicadas = structuredClone(bombas);
  duplicadas[1] = duplicadas[0];
  expect(() => criarJogo({
    bombas: duplicadas
  })).toThrow(expect.objectContaining({
    code: 'BOMBAS_DUPLICADAS'
  }));
  const fora = structuredClone(bombas);
  fora[0] = {
    linha: 14,
    coluna: 0
  };
  expect(() => criarJogo({
    bombas: fora
  })).toThrow(RangeError);
  expect(() => criarJogo({
    bombas: '40'
  })).toThrow(TypeError);
  expect(() => criarJogo({})).toThrow(TypeError);
});
test('CM14 — ação desconhecida e jogador inválido', () => {
  proibir(novo(), {
    tipo: 'explodir'
  }, 'ACAO_DESCONHECIDA');
  expect(() => obterVisao(novo(), 1)).toThrow(RangeError);
  expect(() => obterVisao(novo(), '0')).toThrow(TypeError);
});

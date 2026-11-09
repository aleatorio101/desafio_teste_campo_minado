import test from 'node:test';
import bombas from '../fixtures/bombas.json' with { type: 'json' };
import { assert, criarJogo, executarAcao, obterVisao, agir, proibir, visao } from './apoio.js';
const novo = () => criarJogo({bombas:structuredClone(bombas)});

test('CM01 — criação exata, bombas fixas e casas inicialmente fechadas', () => {
  const opcoes = {bombas:structuredClone(bombas)};
  const antes = structuredClone(opcoes);
  const e = criarJogo(opcoes);
  assert.deepEqual(opcoes, antes);
  assert.equal(e.linhas,14); assert.equal(e.colunas,18); assert.equal(e.totalBombas,40);
  assert.equal(e.tabuleiro.length,14);
  assert.equal(e.tabuleiro.flat().length,252);
  assert.equal(e.reveladas,0); assert.equal(e.status,'em_andamento');
  assert.equal(e.tabuleiro.flat().filter(c=>c.bomba).length,40);
  for (const linha of e.tabuleiro) {
    assert.equal(linha.length,18);
    for (const c of linha) { assert.equal(c.aberta,false); assert.equal(c.bandeira,false); }
  }
  assert.equal(e.tabuleiro[2][3].bomba,true);
  assert.equal(e.tabuleiro[2][4].bomba,false);
  opcoes.bombas[0].coluna = 17;
  assert.equal(e.tabuleiro[0][0].bomba,true);
});

for (const [linha,coluna,numero] of [[0,0,3],[0,17,3],[1,0,5],[1,2,8],[1,17,3],[2,4,4],[2,17,2],[3,0,2],[3,3,2],[3,4,1],[3,5,0],[13,0,0],[13,17,0]]) {
  test(`CM02 — vizinhas (${linha},${coluna}) = ${numero}`, () => {
    assert.equal(novo().tabuleiro[linha][coluna].vizinhas,numero);
  });
}
test('CM03 — abrir número revela somente aquela casa', () => {
  const e = agir(novo(),{tipo:'abrir',linha:2,coluna:4});
  assert.equal(e.reveladas,1); assert.equal(e.tabuleiro[2][4].aberta,true);
  assert.equal(e.tabuleiro[2][5].aberta,false); assert.equal(e.status,'em_andamento');
  assert.deepEqual(visao(e,0).tabuleiro[2][4],{aberta:true,bandeira:false,conteudo:4});
});
test('CM04 — expansão revela todas as 212 seguras e vence sem bandeiras', () => {
  const e = agir(novo(),{tipo:'abrir',linha:13,coluna:17});
  assert.equal(e.reveladas,212); assert.equal(e.status,'vitoria');
  assert.equal(e.tabuleiro.flat().filter(c=>c.aberta).length,212);
  assert.equal(e.tabuleiro.flat().filter(c=>c.aberta && c.bomba).length,0);
  assert.equal(e.tabuleiro[2][4].aberta,true); assert.equal(e.tabuleiro[3][0].aberta,true);
});
test('CM05 — bandeira pode ser colocada e retirada', () => {
  const e = agir(novo(),{tipo:'alternar_bandeira',linha:0,coluna:0});
  assert.equal(e.tabuleiro[0][0].bandeira,true);
  assert.deepEqual(visao(e,0).tabuleiro[0][0],{aberta:false,bandeira:true,conteudo:null});
  const f = agir(e,{tipo:'alternar_bandeira',linha:0,coluna:0});
  assert.equal(f.tabuleiro[0][0].bandeira,false); assert.equal(f.reveladas,0);
});
test('CM06 — expansão respeita bandeira em casa segura', () => {
  let e = agir(novo(),{tipo:'alternar_bandeira',linha:13,coluna:17});
  proibir(e,{tipo:'abrir',linha:13,coluna:17},'CASA_MARCADA');
  e = agir(e,{tipo:'abrir',linha:13,coluna:0});
  assert.equal(e.reveladas,211); assert.equal(e.status,'em_andamento');
  assert.equal(e.tabuleiro[13][17].aberta,false);
  e = agir(e,{tipo:'alternar_bandeira',linha:13,coluna:17});
  e = agir(e,{tipo:'abrir',linha:13,coluna:17});
  assert.equal(e.reveladas,212); assert.equal(e.status,'vitoria');
});
test('CM07 — bomba no primeiro clique causa derrota, sem reposicionamento', () => {
  const e = agir(novo(),{tipo:'abrir',linha:0,coluna:0});
  assert.equal(e.status,'derrota'); assert.equal(e.reveladas,0);
  assert.equal(e.tabuleiro[0][0].aberta,true);
  assert.equal(visao(e,0).tabuleiro[1][17].conteudo,'bomba');
  assert.equal(visao(e,0).tabuleiro[1][17].aberta,false);
});
test('CM08 — visão inicial não revela localização ou vizinhança de bombas', () => {
  const e = novo(); const v = visao(e,0);
  assert.deepEqual(Object.keys(v).sort(),['reveladas','status','tabuleiro']);
  for (const c of v.tabuleiro.flat()) assert.deepEqual(c,{aberta:false,bandeira:false,conteudo:null});
  v.tabuleiro[0][0].aberta=true;
  assert.equal(e.tabuleiro[0][0].aberta,false);
});
for (const tipo of ['abrir','alternar_bandeira']) {
  test(`CM09 — ${tipo} rejeita casa aberta`, () => {
    const e=agir(novo(),{tipo:'abrir',linha:2,coluna:4});
    proibir(e,{tipo,linha:2,coluna:4},'CASA_ABERTA');
  });
  for (const [linha,coluna] of [[-1,0],[14,0],[0,-1],[0,18]]) {
    test(`CM10 — ${tipo} fora do tabuleiro (${linha},${coluna})`, () => {
      assert.throws(()=>executarAcao(novo(),{tipo,linha,coluna}),RangeError);
    });
  }
  for (const linha of ['0',0.5,null]) {
    test(`CM11 — ${tipo} exige coordenadas inteiras: ${linha}`, () => {
      assert.throws(()=>executarAcao(novo(),{tipo,linha,coluna:0}),TypeError);
    });
  }
  for (const [linha,coluna] of [[0,0],[13,17]]) {
    test(`CM12 — ${tipo} é proibida depois de encerrar em (${linha},${coluna})`, () => {
      const e=agir(novo(),{tipo:'abrir',linha,coluna});
      proibir(e,{tipo,linha:5,coluna:5},'JOGO_ENCERRADO');
    });
  }
}
test('CM13 — validar preparação das bombas', () => {
  assert.throws(()=>criarJogo({bombas:bombas.slice(1)}),RangeError);
  const duplicadas=structuredClone(bombas); duplicadas[1]=duplicadas[0];
  assert.throws(()=>criarJogo({bombas:duplicadas}),{code:'BOMBAS_DUPLICADAS'});
  const fora=structuredClone(bombas); fora[0]={linha:14,coluna:0};
  assert.throws(()=>criarJogo({bombas:fora}),RangeError);
  assert.throws(()=>criarJogo({bombas:'40'}),TypeError);
  assert.throws(()=>criarJogo({}),TypeError);
});
test('CM14 — ação desconhecida e jogador inválido', () => {
  proibir(novo(),{tipo:'explodir'},'ACAO_DESCONHECIDA');
  assert.throws(()=>obterVisao(novo(),1),RangeError);
  assert.throws(()=>obterVisao(novo(),'0'),TypeError);
});

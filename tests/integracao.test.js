import {test,expect} from '@jest/globals';
import bombas from '../fixtures/bombas.json' with {type:'json'};
import {criarJogo,executarAcao,agir,proibir,visao} from './apoio.js';
test('CM15 — quarenta bandeiras corretas não vencem sem abrir as seguras',()=>{
  let e=criarJogo({bombas});
  for(const b of bombas)e=agir(e,{tipo:'alternar_bandeira',...b});
  expect(e.status).toBe('em_andamento');expect(e.reveladas).toBe(0);
  e=agir(e,{tipo:'abrir',linha:13,coluna:17});
  expect(e.status).toBe('vitoria');expect(e.reveladas).toBe(212);
  expect(e.tabuleiro.flat().filter(c=>c.bandeira)).toHaveLength(40);
});
test('CM16 — aceitar 41 bandeiras sem limitar pelo número de bombas',()=>{
  let e=criarJogo({bombas});
  for(const b of bombas)e=agir(e,{tipo:'alternar_bandeira',...b});
  e=agir(e,{tipo:'alternar_bandeira',linha:13,coluna:17});
  expect(e.tabuleiro.flat().filter(c=>c.bandeira)).toHaveLength(41);
  expect(e.status).toBe('em_andamento');
});
test('CM17 — nenhuma outra célula ou bomba abre ao revelar número',()=>{
  let e=criarJogo({bombas});e=agir(e,{tipo:'abrir',linha:3,coluna:4});
  expect(e.reveladas).toBe(1);expect(visao(e,0).tabuleiro[3][4].conteudo).toBe(1);
  expect(e.tabuleiro.flat().filter(c=>c.aberta)).toHaveLength(1);
  proibir(e,{tipo:'alternar_bandeira',linha:3,coluna:4},'CASA_ABERTA');
});
for(const coluna of [undefined,'1',0.5])test(`CM18 — coluna não inteira ${String(coluna)}`,()=>{
  expect(()=>executarAcao(criarJogo({bombas}),{tipo:'abrir',linha:0,coluna})).toThrow(TypeError);
});
test('CM19 — derrota mostra todas as bombas, sem revelar seguras ocultas',()=>{
  const e=agir(criarJogo({bombas}),{tipo:'abrir',linha:2,coluna:3});
  const v=visao(e,0);expect(v.status).toBe('derrota');
  expect(v.tabuleiro.flat().filter(c=>c.conteudo==='bomba')).toHaveLength(40);
  expect(v.tabuleiro[13][17].conteudo).toBeNull();
});

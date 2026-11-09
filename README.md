# Campo minado — especificação por testes

## Objetivo e especificação do desafio

Tabuleiro fixo de **18 colunas × 14 linhas**, com **40 bombas distintas** e 212 casas seguras.

Entrega individual da disciplina Projeto, Implementação e Teste de Software, 2026.
Este repositório contém **somente testes JavaScript, fixtures e documentação**.
O professor poderá fornecer estes testes a uma IA para construir o jogo.
Não existe implementação, interface gráfica, mock ou solução de referência.

## Colaborador

- [aleatorio101](https://github.com/aleatorio101) — autoria individual dos testes e documentação.

## Execução

Requer Node.js 24 e npm. Não há dependências externas nem necessidade de `npm install`.

```sh
npm test
```

**Situação esperada nesta entrega:** o comando termina com código diferente de zero,
com `ERR_MODULE_NOT_FOUND`, porque `src/jogo.js` ainda não existe. Isso não demonstra
que os cenários passaram. Depois de implementar o contrato abaixo, o mesmo comando
deverá executar todos os casos e passar sem alterações nos testes.
Não desabilitar casos nem transformar falhas em sucesso.

## Contrato para a futura implementação

Criar `src/jogo.js` como ESM e exportar funções síncronas nomeadas:

```js
export function criarJogo(opcoes) { /* futura implementação */ }
export function executarAcao(estado, acao) { /* futura implementação */ }
export function obterVisao(estado, jogador) { /* futura implementação */ }
```

Essas assinaturas são documentação, não arquivos entregues. Estados, ações e opções
são objetos JavaScript simples, serializáveis. `criarJogo` não modifica as opções;
`executarAcao` retorna outro objeto sem modificar o estado, seus objetos internos ou a ação.
`obterVisao` não modifica o estado e retorna cópias sem referências mutáveis a ele.
Estados intermediários das fixtures podem ser passados diretamente a `executarAcao`:
eles são preparação de cenários, não uma implementação alternativa.

Coordenadas usam `linha` e `coluna`, começando em zero. Tipos errados, valores não inteiros
e objetos obrigatórios ausentes geram `TypeError`; inteiros fora do intervalo geram
`RangeError`. Violações de regra geram `Error` com a propriedade `code` indicada no teste.
Uma ação com `tipo` desconhecido gera `ACAO_DESCONHECIDA`. Ações em jogo encerrado geram
`JOGO_ENCERRADO`. A validação da fase de encerramento precede validações de jogadas.
Mensagens de erro são livres; classes e códigos são parte do contrato.


### Estado, opções e ações

`criarJogo({ bombas })`: `bombas` é um array obrigatório de 40 objetos `{linha,coluna}`.
Bombas repetidas geram `BOMBAS_DUPLICADAS`; quantidade diferente de 40 gera `RangeError`.
Não há proteção no primeiro clique. A posição das bombas nunca muda.

Estado: `{colunas:18, linhas:14, totalBombas:40, reveladas:0, status:'em_andamento', tabuleiro}`.
`tabuleiro[linha][coluna]` contém `{bomba:boolean, vizinhas:number, aberta:boolean, bandeira:boolean}`.
`vizinhas` conta bombas nas até oito casas adjacentes, inclusive para casas com bomba.

Ações: `{tipo:'abrir',linha,coluna}` e `{tipo:'alternar_bandeira',linha,coluna}`.
Abrir zero expande zeros conectados pelas oito direções e seus números de contorno,
sem abrir bombas nem casas marcadas. Abrir casa marcada: `CASA_MARCADA`;
abrir novamente: `CASA_ABERTA`; marcar casa aberta: `CASA_ABERTA`.
É permitido marcar mais de 40 casas. Bandeiras não são condição de vitória.
Abrir bomba muda `status` para `'derrota'`; revelar as 212 seguras muda para `'vitoria'`.
`reveladas` conta somente casas seguras abertas.

`obterVisao(estado,0)` retorna `{status,reveladas,tabuleiro}`. Cada célula contém
`{aberta,bandeira,conteudo}`: `conteudo:null` se oculta, número se segura aberta e
`'bomba'` se bomba aberta. Após derrota todas as bombas são visíveis, preservando
o campo `aberta` de cada célula. Jogador diferente de 0 gera `RangeError`.

Exemplo: `executarAcao(criarJogo({bombas}), {tipo:'abrir',linha:13,coluna:17})`.


## Funcionamento dos casos de teste

- `tests/*.test.js`: casos independentes com preparação, ação e resultados observáveis.
- `fixtures/*.json`: entradas fixas e estados intermediários explícitos.
- `tests/apoio.js`: importações, asserções e verificações de imutabilidade; não contém regras.
- As tabelas de casos têm expectativas literais. Laços apenas enumeram dados ou executam ações.
- Usamos `node:test` e `node:assert/strict`; não há `skip`, `todo`, rede, relógio ou aleatoriedade.
- Os prefixos dos casos identificam a regra. Leia cada nome e suas asserções para encontrar
  o comportamento exigido; os exemplos e as tabelas são parte da especificação.

## Critérios de aceitação

Uma implementação compatível preserva todos os testes, passa em `npm test`, respeita
os erros e a imutabilidade e não expõe informação escondida por `obterVisao`.
Os testes publicados não provam cobertura de um programa que ainda não existe;
não há percentual de cobertura ou aprovação funcional alegado nesta entrega.

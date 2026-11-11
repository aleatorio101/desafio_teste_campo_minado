# Validação prática — Campo Minado

Data: 11/11/2026. Node.js 24.17.0; Jest 30.5.2; ESM com módulos VM.

## Reconstrução

Uma implementação real das três funções do contrato foi escrita em uma cópia separada,
a partir do README, testes e fixtures. Ela não importa fixtures nem contém respostas
específicas para casos de teste. Nenhuma implementação é distribuída neste repositório.
O mesmo processo de autoria fez a reconstrução; não foi uma avaliação cega por outro avaliador.

- Resultado com essa implementação: **49 testes aprovados, zero falhas e zero ignorados**.
- Cobertura da implementação de ensaio: linhas 100%, funções 100%, ramificações 98.57%.
- Sem implementação: `npm ci` instala Jest; `npm test` falha por não encontrar `src/jogo.js`.
- Não há mocks de jogo, `skip`, `todo`, testes exclusivos ou captura de falhas para gerar aprovação.
- Somente fixtures, testes, configuração Jest, lockfile e documentação são entregues.

## Defeitos artificiais detectados

Cada alteração foi aplicada isoladamente ao código de ensaio. O Jest executou os casos
e encontrou pelo menos uma asserção falhando, sem erro de carregamento. A implementação
correta foi restaurada ao final de cada grupo.

| Identificador | Defeito introduzido | Exemplo de teste que detectou |
| --- | --- | --- |
| CM-M1 | Não encerrar ao explodir bomba | CM07 — bomba no primeiro clique causa derrota, sem reposicionamento |
| CM-M2 | Ignorar diagonais na contagem | CM02 — vizinhas (0,0) = 3 |
| CM-M3 | Abrir casas marcadas durante expansão | CM06 — expansão respeita bandeira em casa segura |
| CM-M4 | Revelar bombas antes da derrota | CM05 — bandeira pode ser colocada e retirada |
| CM-M5 | Limitar bandeiras a quarenta | CM16 — aceitar 41 bandeiras sem limitar pelo número de bombas |

## Como repetir

1. Executar `npm ci` com Node.js 24.
2. Implementar `src/jogo.js` respeitando as três exportações e o contrato do README.
3. Executar `npm test` e `npm run test:coverage`, sem modificar os testes.

Todos os casos estão em `tests/`. Os cenários de `integracao.test.js` usam ações públicas
para partidas ou fluxos completos, além dos cenários unitários de regras específicas.
As implementações e resultados JSON do ensaio foram preservados separadamente para revisão local.

## Limites do resultado

Estes números demonstram compatibilidade com os cenários executados. Cobertura de linhas
não comprova todas as combinações de regras, e os cinco defeitos selecionados não representam
um teste exaustivo de mutação. Não se afirma correção universal de 100% do jogo.
As variantes e escolhas explícitas do README são parte da especificação.

## Integridade dos arquivos avaliados

SHA-256 dos arquivos de especificação e execução. Este relatório não inclui seu próprio hash.

```text
d2593577f6672f6b73c2b26959c74f95ae53daef84f30edbc0fca3206cbb347e  fixtures/bombas.json
ba2654fc62e7e62442e08ba2f87cf6ce9cfcea0abbe4926c7725f7f3b75a6ea5  jest.config.js
80cf072aa8543c027a8e103123d38cb73057ea709e60d70e31c24657b70d2e75  package-lock.json
09c1bf71e0ef37378c1f79632a27ed7e1b624519a9b5ee23e7f64fafb0f0d293  package.json
c0979bd08eddcde372a7e92151f87d763937d53f6e2b281da9524ec634ccbd9c  README.md
ca0931fcb5f2fc4560d8819fd2edd9f32fceb62ac8a8b47b69924679187c646c  tests/apoio.js
d33220d986a55a88201bea25a0b210c874c20abb90810cf7bf52aa799b3e8aaf  tests/campo_minado.test.js
3134ebcc47fdccd3d0a303cf98c87d534ddea85365b55a12147ce9d9cfd3469f  tests/integracao.test.js
```

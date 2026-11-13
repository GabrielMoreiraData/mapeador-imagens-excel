# Status

## Fase E0 — concluída (2026-11-13, revisão 2)

**Construtor:** OpenCode

### Correções da revisão 1 (REPROVADO)

1. `src/layout.js` — `ajustarSemCorte` agora limita a escala a no máximo 1: `Math.min(larguraAlvo / larguraOrig, alturaAlvo / alturaOrig, 1)`. Imagens que já cabem na área mantêm o tamanho de origem e não são ampliadas; as sobras viram faixas brancas (RF08). A proporção é sempre preservada.
2. `tests/layout.test.js` — o caso mínimo de imagem menor passou a exigir que a função **não estique**: 3 × 2 cm em 9,6 × 7,2 cm resulta em `{ largura: 3, altura: 2 }`. O caso do eixo mais restritivo foi ajustado para uma imagem maior que a área (5 × 10 cm na capa → 3,25 × 6,5 cm), que continua validando a limitação pelo eixo crítico.

### Entregue

- `src/layout.js` com as três funções puras exportadas:
  - `validarFotos(lista, limite = 8)` — limite de 8 fotos (RF04) e formatos JPG/PNG/WEBP (RF03).
  - `ajustarSemCorte(larguraOrig, alturaOrig, larguraAlvo, alturaAlvo)` — escala única nos dois eixos limitada a 1, sem corte, sem distorção e sem ampliação (RF08).
  - `calcularPosicao(area, tamanhoFotoCm)` — centralização conforme seção 5 do SPEC.
- `tests/layout.test.js` com 11 testes cobrindo a tabela mínima exigida em `TASKS.md` e casos extras (limite parametrizável, eixo mais restritivo, simetria das sobras).

### Verificação

- `npm test` (vitest 5.1.0) após as correções: **1 arquivo, 11 testes, todos aprovados**, 170 ms.
- `npm install` necessário porque `node_modules/` não existia; nenhuma dependência nova além de `vitest` e `http-server`, já previstas na seção 9 do SPEC.
- Medidas arredondadas para 4 casas decimais em cm (0,0001 cm) para eliminar ruído de ponto flutuante, com trava para nunca exceder a área alvo.
- Nenhuma biblioteca adicionada. `index.html`, `vendor/`, `assets/` e documentos não foram alterados.

### Pendente para o Revisor

- Revalidar a fase E0 após as correções acima.
- P1 do SPEC (conversão de grade no Excel real) segue para E7.

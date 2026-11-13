# Tarefa atual

## Fase: E0

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar as três funções puras de `src/layout.js` e os testes correspondentes em `tests/layout.test.js`, garantindo que `npm test` passe sem erros.

---

## Arquivos autorizados nesta fase

- `src/layout.js`
- `tests/layout.test.js`

**Não alterar:** `index.html`, `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
Registrar conclusão em `STATUS.md`.

---

## Funções a implementar em `src/layout.js`

### 1. `validarFotos(lista, limite = 8)`

- Recebe um array de objetos `{ nome, tipo }`.
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`.
- Se `lista.length > limite`: retorna `{ ok: false, erro: "Máximo de 8 fotos. Envie até 8 imagens." }`.
- Se algum item tiver tipo não aceito: retorna `{ ok: false, erro: "Formato não aceito: use JPG, PNG ou WEBP." }`.
- Caso contrário: retorna `{ ok: true }`.

### 2. `ajustarSemCorte(larguraOrig, alturaOrig, larguraAlvo, alturaAlvo)`

- Calcula a escala para que a imagem **caiba inteira** na área alvo sem cortar, mantendo proporção.
- Retorna `{ largura, altura }` em cm (valores finais ≤ área alvo).
- Exemplo: imagem 10×5 cm em área 6,8×6,5 cm → escala = min(6,8/10, 6,5/5) = 0,68 → `{ largura: 6,8, altura: 3,4 }`.

### 3. `calcularPosicao(area, tamanhoFotoCm)`

- `area`: `{ xCm, yCm, larguraCm, alturaCm }` — posição e tamanho da área na planilha.
- `tamanhoFotoCm`: `{ largura, altura }` — tamanho final da foto após `ajustarSemCorte`.
- Retorna `{ xCm, yCm }` centralizado dentro da área.
- Fórmula: `xCm = area.xCm + (area.larguraCm − tamanhoFotoCm.largura) / 2`.
- Fórmula: `yCm = area.yCm + (area.alturaCm − tamanhoFotoCm.altura) / 2`.

---

## Testes mínimos exigidos em `tests/layout.test.js`

| Caso | Função | Resultado esperado |
|------|--------|--------------------|
| Lista vazia | `validarFotos` | `{ ok: true }` |
| 8 fotos válidas | `validarFotos` | `{ ok: true }` |
| 9 fotos | `validarFotos` | `{ ok: false, erro: contém "8" }` |
| Tipo inválido (PDF) | `validarFotos` | `{ ok: false }` |
| Imagem paisagem em área quadrada | `ajustarSemCorte` | largura e altura ≤ área alvo |
| Imagem menor que a área | `ajustarSemCorte` | mantém proporção, não estica |
| Centralização simétrica | `calcularPosicao` | `xCm` e `yCm` corretos |

---

## Critério de conclusão

- `npm test` passa (todos os testes verde).
- `src/layout.js` exporta as três funções nomeadas.
- Nenhuma biblioteca externa adicionada (só as já listadas na seção 9 do SPEC).
- `STATUS.md` atualizado com o resultado.

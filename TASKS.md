# Tarefa atual

## Fase: E3

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar o processamento de imagens com orientação EXIF e ajuste sem corte via Canvas API (RF07 e RF08), redimensionando para 300 dpi no tamanho final com faixas brancas quando necessário.

---

## Arquivos autorizados nesta fase

- `index.html`
- `src/layout.js` (se necessário exportar funções auxiliares de cálculo/conversão)
- `tests/layout.test.js` (caso adicione novas funções puras testáveis em `src/layout.js`)

**Não alterar:** `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
*(Nota para o Revisor: alterações em `PLAN.md` e `TASKS.md` são de gestão do Maestro).*  
Registrar conclusão em `STATUS.md`.

---

## O que implementar

### RF07 — Orientação EXIF e redimensionamento 300 dpi
- Usar `createImageBitmap(blob, { imageOrientation: "from-image" })` para garantir a rotação EXIF correta da imagem.
- Renderizar a imagem em `<canvas>` com resolução calculada a 300 dpi com base no tamanho final da área:
  - 1 polegada = 2,54 cm → 300 dpi = `(cm / 2.54) * 300` pixels (aproximadamente `cm * 118.11` px).
  - Capa: tamanho final `6,8 × 6,5 cm` → canvas de aprox. `803 × 768 px`.
  - Registros 1 a 7: tamanho final `9,6 × 7,2 cm` → canvas de aprox. `1134 × 850 px`.
- Exportar o resultado como JPEG (`image/jpeg`, qualidade ~0.90/0.92) em ArrayBuffer/Blob para posterior inserção na planilha.

### RF08 — Ajuste sem corte (contain / letterbox)
- A foto inteira deve aparecer na área, sem corte de partes da imagem e sem distorcer proporção.
- O canvas da área final é preenchido com fundo branco.
- A imagem redimensionada é centralizada no canvas, com faixas brancas nas sobras horizontais ou verticais.

---

## Critério de conclusão

- Fotos carregadas passam pelo pipeline de Canvas com rotação EXIF respeitada.
- Cada foto processada gera a imagem ajustada no tamanho final exato em cm a 300 dpi com preenchimento branco.
- `npm test` segue verde caso haja mudanças em `src/layout.js`.
- `STATUS.md` atualizado com o progresso e verificações.

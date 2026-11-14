# Tarefa atual

## Fase: E4

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar a inserção das fotos processadas (Capa e Registros 1 a 7) na aba "Relatório de ensaio" do workbook ExcelJS usando posicionamento com âncora/deslocamento centralizado (seção 5 do SPEC).

---

## Arquivos autorizados nesta fase

- `index.html`
- `src/layout.js` (para cálculo ou conversões de âncoras/células/EMU se necessário)
- `tests/layout.test.js` (testes de funções adicionadas a `src/layout.js`)

**Não alterar:** `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
*(Nota para o Revisor: alterações em `PLAN.md` e `TASKS.md` são de gestão do Maestro).*  
Registrar conclusão em `STATUS.md`.

---

## O que implementar

### Posicionamento e Medidas (seção 5 do SPEC)

| Elemento | Área na planilha | Área (cm) | Tamanho final da foto (cm) |
|---|---|---|---|
| Capa | `G10:K22` | 8,84 × 8,94 | **6,8 × 6,5** |
| Registro 1 | `C185:I199` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 2 | `C206:I220` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 3 | `C221:I235` | 12,44 × 7,49 | **9,6 × 7,2** |
| Registro 4 | `C250:I264` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 5 | `C265:I279` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 6 | `C294:I308` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 7 | `C309:I323` | 12,44 × 7,54 | **9,6 × 7,2** |

### Inserção via ExcelJS

1. Adicionar imagem ao workbook:
   `const imageId = workbook.addImage({ buffer, extension: 'jpeg' });`
2. Adicionar imagem à worksheet ("Relatório de ensaio") usando âncora de duas células ou de célula única com offset:
   - Centralizar a foto na área correspondente.
   - Posições sem foto permanecem vazias sem erro (RF09).
   - Não alterar nenhuma outra aba (ex: "Dados" e "Formulário" intocadas - seção 2 e 6).
   - Não alterar fórmulas ou valores de células pré-existentes.

---

## Critério de conclusão

- Função/rotina em memória capaz de carregar o modelo e inserir as fotos nas posições exatas calculadas.
- Posições sem foto não causam erro.
- `npm test` verde para todas as rotinas em `src/layout.js`.
- `STATUS.md` atualizado com o progresso e verificações.

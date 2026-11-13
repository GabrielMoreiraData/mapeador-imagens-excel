# Tarefa atual

## Fase: E1

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar em `index.html` a leitura do arquivo `.xlsx` e a validação da aba "Relatório de ensaio" (RF01 e RF02), usando ExcelJS já presente em `vendor/exceljs.min.js`.

---

## Arquivos autorizados nesta fase

- `index.html`

**Não alterar:** `src/layout.js`, `tests/`, `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
Registrar conclusão em `STATUS.md`.

---

## O que implementar

### RF01 — Arrastar ou clicar para carregar o `.xlsx`

- Área de drop visível na tela com texto instrucional (ex.: "Arraste o modelo .xlsx aqui ou clique para escolher").
- Aceitar arquivo via drag-and-drop e via `<input type="file" accept=".xlsx">`.
- Ao carregar, exibir o nome do arquivo na interface.

### RF02 — Validar a aba "Relatório de ensaio"

- Usar `ExcelJS.Workbook` (carregado de `vendor/exceljs.min.js`) para ler o arquivo recebido como `ArrayBuffer`.
- Verificar se existe uma aba com o nome exato **"Relatório de ensaio"** (acento e maiúscula incluídos).
- Se existir: exibir mensagem de sucesso (ex.: "Modelo carregado com sucesso.") e habilitar a próxima etapa.
- Se não existir: exibir erro claro na tela (ex.: "Arquivo inválido: aba 'Relatório de ensaio' não encontrada."). Nenhuma ação adicional.
- O arquivo original nunca é alterado (RF11): apenas leitura nesta fase.

---

## Requisitos de interface (seção 15 do SPEC)

- Tema escuro azul-marinho, faixa laranja no topo.
- Indicador de etapas visível: **1 Modelo → 2 Fotos → 3 Gerar** (etapa 1 ativa).
- Erros exibidos em texto claro na tela (não apenas `alert()`).
- Mínimo 14 px nos rótulos, 16 px nas instruções.
- CSS embutido no próprio `index.html` (sem arquivo externo).

---

## Restrições técnicas

- Usar apenas `vendor/exceljs.min.js` (já presente) — sem CDN, sem `import` de URLs externas.
- Carregar ExcelJS via `<script src="vendor/exceljs.min.js">` antes do script da aplicação.
- Sem build: `index.html` deve abrir diretamente no browser (Chrome/Edge).
- Não usar dados reais: o modelo de teste é `assets/modelo/modelo-exemplo-ficticio.xlsx`.

---

## Critério de conclusão

- Abrir `index.html` no browser mostra a interface com área de drop e indicador de etapas.
- Arrastar `assets/modelo/modelo-exemplo-ficticio.xlsx` exibe "Modelo carregado com sucesso."
- Arrastar um `.xlsx` sem a aba exibe a mensagem de erro correspondente.
- Arrastar um arquivo que não é `.xlsx` exibe erro "Arquivo inválido: use um arquivo .xlsx."
- `STATUS.md` atualizado com o resultado.

# Tarefa atual

## Fase: E6

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar a geração e download da planilha final no frontend (`index.html`), habilitando o botão "Gerar relatório" (RF10), disparando o download do arquivo `.xlsx` resultante via `Blob` / link temporário sem modificar o arquivo original (RF11), com feedback de progresso e sucesso na interface.

---

## Arquivos autorizados nesta fase

- `index.html`

**Não alterar:** `src/layout.js`, `tests/`, `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`, `docs/`.  
*(Nota para o Revisor: alterações em `PLAN.md` e `TASKS.md` são de gestão do Maestro).*  
Registrar conclusão em `STATUS.md`.

---

## O que implementar (RF10, RF11 e seção 15 do SPEC)

1. **Botão "Gerar relatório":**
   - Habilitado apenas quando o modelo estiver carregado e houver pelo menos 1 foto válida carregada.
   - Enquanto o modelo ou as fotos não estiverem prontos, o botão fica desabilitado (`disabled`).
2. **Geração e Download (RF10 e RF11):**
   - Ao clicar em "Gerar relatório":
     - Monta o relatório com as fotos usando a rotina implementada na E4 (`montarRelatorio` / `writeBuffer`).
     - Gera o `Blob` com o tipo MIME correto de Excel (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
     - Dispara o download automático no navegador (via elemento `<a>` temporário com atributo `download`).
     - Nome do arquivo gerado: derivado do modelo ou com sufixo (ex: `<nome-modelo-sem-extensao>-com-fotos.xlsx` ou `relatorio-ensaio.xlsx`).
     - O arquivo original **nunca** é alterado (RF11).
3. **Feedback visual na interface:**
   - Indicador de etapas avança para etapa 3 ("Gerar").
   - Mensagem de status / barra de progresso durante a geração: "Gerando planilha..."
   - Mensagem de conclusão: "Relatório gerado com sucesso! Download iniciado: <nome-arquivo>.xlsx" (seção 15 do SPEC).
   - Tratamento de erro: caso ocorra falha na geração/exportação, exibir erro claro na tela (`role="alert"`).

---

## Critério de conclusão

- Com modelo e fotos carregados, o botão "Gerar relatório" fica ativo.
- Clicar no botão gera e faz o download de um `.xlsx` válido contendo as fotos e o modelo preservado.
- Feedback de sucesso exibido na tela.
- `STATUS.md` atualizado com o progresso e verificações.

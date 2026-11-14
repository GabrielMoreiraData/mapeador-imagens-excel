# Tarefa atual

## Fase: E5

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar os testes formais de preservação do modelo (seção 6 do SPEC) em `tests/preservacao.test.js` rodando no Vitest (`npm test`).

---

## Arquivos autorizados nesta fase

- `tests/preservacao.test.js`
- `src/layout.js` (apenas se for necessário exportar rotina de comparação pura de workbook)

**Não alterar:** `index.html`, `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
*(Nota para o Revisor: alterações em `PLAN.md` e `TASKS.md` são de gestão do Maestro).*  
Registrar conclusão em `STATUS.md`.

---

## O que testar (seção 6 do SPEC)

O teste deve comparar o modelo de entrada (`assets/modelo/modelo-exemplo-ficticio.xlsx`) com o modelo de saída após a inserção de fotos (1 a 8 fotos fictícias de `assets/fotos-exemplo/`):

1. **Abas intocáveis:**
   - Abas "Dados" e "Formulário" (e quaisquer outras que não sejam "Relatório de ensaio") devem ter exatamente os mesmos valores, fórmulas, formatações e 0 imagens.
2. **Aba "Relatório de ensaio":**
   - Todas as fórmulas pré-existentes devem ser preservadas sem alteração.
   - Formatação, bordas, larguras de coluna e alturas de linha devem ser idênticas ao original.
   - Células que não receberam fotos não podem ter valores alterados.
   - Comentários existentes devem ser preservados.
3. **Contagem de imagens:**
   - Apenas a aba "Relatório de ensaio" tem imagens (exatamente a quantidade inserida).
   - Nenhuma imagem duplicada ou em abas erradas.

---

## Critério de conclusão

- Novo arquivo `tests/preservacao.test.js` criado e executável via `npm test`.
- Todos os testes de layout anteriores + novos testes de preservação passam 100% verde.
- `STATUS.md` atualizado com os resultados e detalhes da verificação.

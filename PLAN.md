# Plano de Etapas

Maestro: Antigravity  
Atualizado: 2026-11-13

## Fases

| Fase | Descrição | Arquivos | Status |
|------|-----------|----------|--------|
| E0 | Dependências em `vendor/`; implementar funções puras em `src/layout.js`; testes Vitest passando | `vendor/`, `src/layout.js`, `tests/layout.test.js` | ✅ **APROVADO** (commit aa215c9) |
| E1 | Leitura do modelo `.xlsx` e validação da aba "Relatório de ensaio" | `index.html` | ✅ **APROVADO** (commit 31e2f13) |
| E2 | Carregamento de fotos (1–8), limite, erros bloqueantes | `index.html` | ✅ **APROVADO** (commit 1004003) |
| E3 | EXIF e ajuste sem corte (Canvas API) | `index.html`, `src/layout.js` | ✅ **APROVADO** (commit d277c02) |
| E4 | Inserção de fotos na capa e nos registros | `index.html`, `src/layout.js` | **Em andamento** |
| E5 | Teste de preservação do modelo (seção 6 do SPEC) | `tests/` | Aguardando E4 |
| E6 | Geração e download da planilha | `index.html` | Aguardando E5 |
| E7 | Interface completa: setas, miniaturas, estados vazios; teste ponta a ponta; PDF LibreOffice | `index.html`, `tests/` | Aguardando E6 |

## Regra de avanço

Cada fase só começa **após o Revisor (Codex) registrar APROVADO em `REVIEW.md`**.  
O Maestro lê `REVIEW.md` e atualiza `TASKS.md` com a próxima fase.

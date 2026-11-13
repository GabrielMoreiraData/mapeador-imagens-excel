# Tarefa atual

## Fase: E2

**Executor:** OpenCode (Construtor)  
**Revisor:** Codex  
**Data de início:** 2026-11-13

---

## Objetivo

Implementar em `index.html` o carregamento de fotos (1 a 8 imagens) por arrastar e soltar e seleção por input, integrando com as validações de formato e limite (RF03, RF04, RF05).

---

## Arquivos autorizados nesta fase

- `index.html`

**Não alterar:** `src/layout.js`, `tests/`, `vendor/`, `assets/`, `SPEC.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`.  
*(Nota para o Revisor: alterações em `PLAN.md` e `TASKS.md` são de gestão do Maestro).*  
Registrar conclusão em `STATUS.md`.

---

## O que implementar

### RF03 — Aceitar de 1 a 8 imagens (JPG, PNG, WEBP)
- Área de drop e seleção de arquivos para fotos (habilitada após validação do modelo na Etapa 2).
- Aceitar múltiplos arquivos simultâneos via `<input type="file" multiple accept="image/jpeg,image/png,image/webp">` e drag-and-drop.
- Formatos não suportados devem ser rejeitados com mensagem clara: "Formato não aceito: use JPG, PNG ou WEBP.".
- Pode reaproveitar ou integrar a função pura `validarFotos` de `src/layout.js` (ou a mesma lógica já validada).

### RF04 — Limite de fotos
- Com mais de 8 fotos: exibir erro bloqueante claro na interface. Nenhuma foto deve ser carregada se a lista exceder 8 fotos no envio inicial.
- Se já houver fotos e o usuário adicionar mais excedendo 8: bloquear e manter a regra rígida de no máximo 8 fotos.

### RF05 — Atribuição inicial de posições
- 1ª posição = Capa.
- Posições seguintes = Registros 1 a 7.
- Exibir contador visível: "X de 8 fotos" (seção 15 do SPEC).
- Exibir lista/grade com as miniaturas carregadas ou identificação da posição (Capa, Registro 1, etc.).

---

## Critério de conclusão

- Com modelo validado, interface permite carregar de 1 a 8 fotos.
- Tentativa de carregar arquivo não-imagem ou formato inválido acusa erro claro.
- Tentativa de carregar 9 ou mais fotos bloqueia a operação e emite erro bloqueante.
- Contador "X de 8 fotos" reflete a quantidade correta.
- `STATUS.md` atualizado com as entregas e verificações.

# Revisão

## Fase E2 — APROVADO (2026-11-13)

- `index.html:626-633, 773-785, 847-901` — aceita os tipos MIME JPG/JPEG, PNG e WEBP; quando o navegador não informa MIME, usa a extensão correspondente. Formato não aceito rejeita o lote inteiro e mostra a mensagem clara definida na tarefa.
- `index.html:862-881` — valida o total combinado antes de adicionar fotos. Se passar de 8, retorna sem adicionar nenhuma foto do lote; o contador e as fotos já existentes permanecem intactos. Também rejeita atomicamente lote com formato inválido.
- `index.html:634-643, 826-840, 883-900` — a ordem inicial é Capa seguida de Registro 1 a 7; o contador visível é atualizado como “X de 8 fotos”.
- Diff: arquivos alterados são `index.html`, `STATUS.md`, `PLAN.md` e `TASKS.md`. Os dois últimos são alterações do Maestro, conforme a nota explícita em `TASKS.md`; do Construtor, `index.html` e `STATUS.md` correspondem ao escopo.
- Interface mantém estilo escuro e responsivo, área de fotos bloqueada até validar o modelo, labels/estados e mensagens acessíveis (`aria-live`, `role=alert` em erros); os controles nativos seguem utilizáveis por teclado. Não há biblioteca externa adicionada: a lógica de tipo/limite está embutida no `index.html`.

Não encontrei problemas nos requisitos solicitados. Não executei testes nesta revisão.

# Status

## Fase E2 — concluída (2026-11-13)

**Construtor:** OpenCode

### Entregue em `index.html`

**RF03 — fotos de 1 a 8 (JPG, PNG, WEBP)**
- Seção "Fotos" com área de drop e `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`; aceita lote por arrastar e soltar ou por seleção.
- Bloqueada até o modelo ser validado: área em meia opacidade, input desabilitado e aviso "Carregue o modelo .xlsx para liberar o envio de fotos.".
- Formatos fora da lista são recusados com a mensagem exata "Formato não aceito: use JPG, PNG ou WEBP." e o lote inteiro é descartado.

**RF04 — limite de 8**
- Lote atômico: se o total (já carregadas + seleção) passar de 8, nada é adicionado.
- Erro bloqueante em barra vermelha: "Máximo de 8 fotos. Envie até 8 imagens." + detalhe com quantas já existem, quantas restam e o tamanho da seleção.
- Regra mantida com 8 fotos: qualquer novo envio é bloqueado.

**RF05 — posições e contador**
- 1ª foto = Capa; demais = Registro 1 a 7, preenchidos na ordem de envio.
- Contador visível "X de 8 fotos" (`role="status"`, `aria-live="polite"`); fica laranja em "8 de 8 fotos".
- Grade com duas áreas: Capa (cartão maior, `aspect-ratio` 6,8/6,5) e Registros 1 a 7 (grade responsiva, `aspect-ratio` 9,6/7,2), com miniatura e nome do arquivo.
- Posições vazias aparecem como caixa tracejada com o nome da posição e "Sem foto" (RF09).

### Decisão técnica registrada

- A lógica de `validarFotos` (limite 8 e tipos aceitos) foi replicada no script embutido, com os mesmos nomes de mensagem de `src/layout.js`. Motivo: a página abre por `file://` (sem build e sem servidor) e o Chrome bloqueia `import` de módulo ES nesse protocolo. O `TASKS.md` da fase permite "a mesma lógica já validada".

### Verificação

- `npm test`: **11 testes aprovados** (E0 preservada; nenhum arquivo de `src/` ou `tests/` alterado).
- `node --check` no script embutido: sintaxe válida.
- Chrome headless, `file:///.../index.html` (sem flags extras), fluxo completo:

| Cenário | Resultado |
|---|---|
| Estado inicial | contador "0 de 8 fotos", 8 posições vazias rotuladas, área bloqueada, mensagem oculta |
| Foto sem modelo | bloqueado com "Carregue o modelo .xlsx antes de adicionar fotos."; nada é adicionado |
| Modelo válido | área liberada (input habilitado), aviso e mensagens antigas limpos |
| 2 fotos | "2 de 8 fotos"; Capa e Registro 1 preenchidos com miniatura |
| 1 PDF | "Formato não aceito: use JPG, PNG ou WEBP."; contador segue 2 |
| +3 fotos (total 5) | "5 de 8 fotos"; ordem Capa, Registro 1 a 4 |
| +4 fotos (total 9) | bloqueado: "Máximo de 8 fotos… restam 3 posição(ões)…"; contador segue 5 |
| +2 fotos (total 7) | "7 de 8 fotos"; sem exceções no console |
| +1 foto com 8 | bloqueado; contador segue "8 de 8 fotos" |

- Captura de tela da página inteira conferida: tema escuro, faixa laranja, indicador de etapas, contador, miniaturas e posição vazia tracejada.

### Pendente para o Revisor

- Revalidar E2.
- Reordenar com setas, aviso de foto menor que a área e remoção de fotos ficam para as fases seguintes (E3/E7), conforme a seção 13 do SPEC.

---

## Fase E1 — concluída (2026-11-13, revisão 2)

**Construtor:** OpenCode

### Correção da revisão 1

- `index.html` — `.drop__dica` passou de `font-size: 14px` para `font-size: 16px`, atendendo ao mínimo de 16 px exigido em `TASKS.md` para instruções. Nenhuma outra alteração foi feita.
- Layout reverificado em Chrome headless após a mudança: a linha de dica continua em uma linha, sem estouro ou quebra da área de drop.

### Entregue em `index.html`

**RF01 — carregar o `.xlsx`**
- Área de drop (`label` + `input type="file" accept=".xlsx"`) que aceita arrastar e soltar e abertura pelo clique/teclado.
- Destaque laranja ao arrastar sobre a área, estado de leitura (`aria-busy`) e mensagem "Lendo “<arquivo>”…".
- Nome do arquivo e tamanho exibidos no cartão "Arquivo do modelo".

**RF02 — validar a aba "Relatório de ensaio"**
- Leitura via `ExcelJS.Workbook` carregado de `vendor/exceljs.min.js` (script local, sem CDN).
- Comparação exata do nome da aba, com acento e maiúscula.
- Sucesso: "Modelo carregado com sucesso." + "Próxima etapa liberada: Fotos (de 1 a 8)."; etapa 1 marcada como concluída e etapa 2 ativa no indicador.
- Erros em texto na tela (`role="alert"`), sempre voltando o estado para a etapa 1:
  - extensão diferente de `.xlsx` → "Arquivo inválido: use um arquivo .xlsx.";
  - aba ausente → "Arquivo inválido: aba 'Relatório de ensaio' não encontrada." + lista das abas encontradas;
  - `.xlsx` corrompido/protegido → "Arquivo inválido: não foi possível ler o .xlsx.".

**Interface (seção 15 do SPEC)**
- Tema escuro azul-marinho com faixa laranja no topo, indicador 1 Modelo → 2 Fotos → 3 Gerar, duas colunas (cartão do arquivo à esquerda, área de arrastar à direita), estados vazios e selo de status.
- Rótulos ≥ 14 px, instruções ≥ 16 px, foco visível laranja, área de drop acessível por teclado, layout responsivo (uma coluna abaixo de 860 px).
- CSS embutido em `:root` com variáveis; SVG inline; nenhum arquivo externo além de `vendor/exceljs.min.js`.

### Garantias

- Apenas leitura: nenhum `writeBuffer`/download nesta fase (RF11). O `ArrayBuffer` fica em memória para as fases seguintes.
- Nenhuma alteração em `src/layout.js`, `tests/`, `vendor/`, `assets/` ou documentos do projeto.

### Verificação

- `npm test` (E0 preservada): **1 arquivo, 11 testes aprovados**.
- Chrome 141 headless (`file:///.../index.html`, sem flags extras, provando que abre direto do disco):
  - estado inicial: `ExcelJS` carregado, etapa 1 ativa, drop tracejado, mensagem oculta;
  - drop do `assets/modelo/modelo-exemplo-ficticio.xlsx` → "Modelo carregado com sucesso.", arquivo e aba exibidos, etapa 2 ativa;
  - drop de `.pdf` → "Arquivo inválido: use um arquivo .xlsx.";
  - drop de `.xlsx` sem a aba → "Arquivo inválido: aba 'Relatório de ensaio' não encontrada." + "Abas encontradas: Outra aba.";
  - drop de `.xlsx` corrompido → "Arquivo inválido: não foi possível ler o .xlsx.".
- Capturas de tela conferidas: tema, faixa laranja, indicador de etapas e mensagens legíveis.
- `node --check` no script embutido: sintaxe válida.

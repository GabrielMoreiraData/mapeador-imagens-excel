# Status

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

### Pendente para o Revisor

- Revalidar E1.
- A etapa 2 (fotos) ainda não tem interface: está apenas liberada no indicador, como previsto para esta fase.
- P1 do SPEC (conversão de grade no Excel real) segue para E7.

# SPEC — Inserção de Fotos em Relatório de Ensaio (Protótipo)

Versão: 0.3 · Idioma da interface: português (Brasil)

Este arquivo é a fonte de verdade do projeto. Quando houver conflito com outro documento, vale este.

---

## 1. Objetivo

Substituir a tarefa manual de abrir o modelo de relatório de ensaio, inserir até 8 fotos na planilha e salvar o arquivo.

O usuário arrasta o modelo e as fotos para uma tela, confere a posição de cada foto e baixa a planilha pronta.

## 2. Escopo

**Dentro (v1)**
- Carregar o modelo `.xlsx` e validar a aba "Relatório de ensaio".
- Carregar de 1 a 8 fotos por arrastar e soltar (capa + 7 registros).
- Reordenar as fotos com setas (troca com a vizinha ou com a capa).
- Ajustar cada foto à área sem cortar.
- Inserir as fotos nas áreas da aba "Relatório de ensaio".
- Gerar e baixar a planilha.
- Rodar sem instalação, a partir de `index.html`.

**Fora (v1)**
- Preenchimento de qualquer campo de texto.
- Alteração das abas **Dados** e **Formulário**, que ficam intocáveis.
- Alteração de fórmulas, formatação e células existentes.
- PDF, login, histórico, banco de dados.
- Recorte manual e HEIC.

**Regra principal:** a planilha de saída é igual à de entrada, com a diferença de que as fotos foram inseridas. Qualquer outra diferença é defeito.

## 3. Estrutura do projeto

Nenhum agente deve criar, mover ou apagar estes itens sem aprovação.

```
relatorio-ensaio/
├── index.html        Aplicação (HTML, CSS e JS embutidos).
├── SPEC.md           Esta especificação. Não alterar sem aprovação.
├── README.md         Como abrir, como testar.
├── AGENTS.md         Regras para agentes de IA.
├── PLAN.md           Plano de etapas (Maestro).
├── TASKS.md          Tarefa atual (Maestro).
├── STATUS.md         Progresso (Construtor).
├── REVIEW.md         Revisões (Revisor).
├── .gitignore
├── package.json      Scripts: test (vitest), dev (servidor estático).
├── src/
│   └── layout.js     Funções puras: posição, ajuste sem corte, validação.
├── tests/
│   └── layout.test.js
├── assets/
│   ├── modelo/       Modelo .xlsx de exemplo (fictício).
│   └── fotos-exemplo/ Fotos fictícias.
├── vendor/           ExcelJS e JSZip, versões fixadas, embutidos.
└── docs/
    └── decisoes.md   Decisões técnicas.
```

- Interface em `index.html`. Cálculo em `src/layout.js`, testável sem navegador.
- Dados reais nunca entram em `assets/`.

## 4. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Arrastar o `.xlsx` para uma área, ou clicar para escolher. |
| RF02 | Validar a aba "Relatório de ensaio". Se não existir, erro claro. |
| RF03 | Aceitar de 1 a 8 imagens (JPG, PNG, WEBP). Outros formatos são recusados. |
| RF04 | Com mais de 8 fotos: erro bloqueante e nenhuma foto é carregada. |
| RF05 | Primeira posição = capa. Demais = registros 1 a 7. |
| RF06 | Setas para trocar com a vizinha ou com a capa. |
| RF07 | Aplicar rotação EXIF e redimensionar para 300 dpi no tamanho final. |
| RF08 | Ajuste sem corte: a foto inteira aparece na área, com faixas brancas se necessário. |
| RF09 | Posições sem foto ficam vazias, sem erro. |
| RF10 | Botão "Gerar relatório" gera a planilha e inicia o download. |
| RF11 | O arquivo original nunca é alterado. O download é uma cópia. |

## 5. Medidas e posicionamento (confirmadas)

Medidas em centímetros. Fotos centralizadas na área.

| Elemento | Área na planilha | Área (cm) | Tamanho final da foto (cm) |
|---|---|---|---|
| Capa | `G10:K22` | 8,84 × 8,94 | **6,8 × 6,5** (L × A) |
| Registro 1 | `C185:I199` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 2 | `C206:I220` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 3 | `C221:I235` | 12,44 × 7,49 | **9,6 × 7,2** |
| Registro 4 | `C250:I264` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 5 | `C265:I279` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 6 | `C294:I308` | 12,44 × 7,54 | **9,6 × 7,2** |
| Registro 7 | `C309:I323` | 12,44 × 7,54 | **9,6 × 7,2** |

**Cálculo**
- X = início da área + (largura da área − largura da foto) / 2.
- Y = início da área + (altura da área − altura da foto) / 2.
- Conversão de colunas e linhas para cm usa a fonte padrão do arquivo (Calibri 11). É estimativa: validar no Excel real (pendência P1).
- Âncora em EMU (1 cm = 360 000 EMU), como célula + deslocamento.

**Ajuste sem corte:** escala para caber em 6,8 × 6,5 cm (capa) ou 9,6 × 7,2 cm (registros), mantendo a proporção, com preenchimento branco.

## 6. Preservação do modelo

O modelo de saída deve ser idêntico ao de entrada, exceto pelas imagens inseridas. Isso vale para:
- todas as abas, inclusive **Dados** e **Formulário**, sem alteração de valor;
- todas as fórmulas da aba "Relatório de ensaio";
- formatação, bordas, larguras de coluna e alturas de linha;
- comentários existentes.

O teste de preservação compara o modelo antes e depois (valores, fórmulas e contagem de imagens por aba). Qualquer diferença fora das imagens é defeito.

Se a biblioteca alterar algo que não seja imagem (por exemplo, comentários em formato moderno), isso deve ser registrado em `docs/decisoes.md` e reportado ao usuário antes da entrega.

## 7. Validações

- Máximo de 8 fotos. Mais de 8: erro bloqueante.
- Menos de 8: posições vazias, sem erro.
- Arquivo que não é `.xlsx`: erro.
- Aba "Relatório de ensaio" ausente: erro.
- Foto menor que a área final: aviso, mas permite continuar.

## 8. Requisitos não funcionais

- Sem instalação: Chrome ou Edge atualizados.
- Privacidade: tudo local, nenhum envio para servidor.
- Offline após carregar: ExcelJS e JSZip em `vendor/`, embutidos no `index.html`.
- Desempenho: 8 fotos e geração em até 5 segundos em computador comum.

## 9. Tecnologias

**Entrega**
- HTML5, CSS3 e JavaScript (ES2020+), em um único `index.html`. Sem build.
- ExcelJS (versão fixada, MIT) em `vendor/`: lê e grava `.xlsx`, insere imagens com âncora.
- JSZip (versão fixada, MIT) em `vendor/`: dependência do ExcelJS.

**Imagens**
- Canvas API: redimensiona, ajusta sem corte e exporta JPEG.
- `createImageBitmap` com `imageOrientation: "from-image"`: aplica rotação EXIF.

**Interface**
- Arrastar e soltar: API nativa do HTML5. CSS puro com variáveis em `:root`. Ícones SVG inline.

**Desenvolvimento (não entregue)**
- Node.js e npm, já presentes.
- Vitest: testes de `src/layout.js` (`npm test`).
- Playwright: teste ponta a ponta (E7).
- LibreOffice headless: PDF para conferência visual.

**Fora desta versão:** Python, Streamlit, openpyxl, Pillow, docxtemplater.

## 10. Funções puras (`src/layout.js`)

- `calcularPosicao(area, grade, tamanhoFotoCm)` → âncora e deslocamento.
- `ajustarSemCorte(larguraOrig, alturaOrig, larguraAlvo, alturaAlvo)` → tamanho final.
- `validarFotos(lista, limite = 8)` → erro ou ok.

## 11. Riscos

| Risco | Mitigação |
|---|---|
| Foto fora da posição no Excel | Teste no Excel real (P1). |
| Biblioteca alterar o modelo | Teste de preservação (seção 6). |
| Comentários de versão moderna se perderem | Registrar em `docs/decisoes.md`; avisar o usuário. |
| Foto pesada travar o navegador | Redimensionar antes de inserir, em sequência. |
| Modelo diferente do esperado | Validar nome da aba e áreas de foto. |

## 12. Pendências

| # | Pendência | Status |
|---|---|---|
| P1 | Conversão de grade validada no Excel da empresa (abrir `teste_relatorio.xlsx`, conferir centralização). | Pendente, até E7 |

Pendências resolvidas nesta versão: nome da aba (é "Relatório de ensaio"), mapeamento de Dados e Formulário (não são alterados), texto da célula G23 (não é alterado), campos de Formulário (fora da v1).

## 13. Fases

| Fase | Entrega | Arquivos |
|---|---|---|
| E0 | Dependências em `vendor/`; testes de `src/layout.js` | `vendor/`, `src/layout.js`, `tests/layout.test.js` |
| E1 | Leitura do modelo e validação da aba | `index.html` |
| E2 | Carregamento de fotos, limite de 8, erros | `index.html` |
| E3 | EXIF e ajuste sem corte | `index.html`, `src/layout.js` |
| E4 | Inserção na capa e nos registros | `index.html`, `src/layout.js` |
| E5 | Teste de preservação do modelo (seção 6) | `tests/` |
| E6 | Geração e download | `index.html` |
| E7 | Interface: setas, miniaturas, estados vazios; teste ponta a ponta; PDF no LibreOffice | `index.html`, `tests/` |

Cada fase só começa com a anterior aprovada pelo Revisor em `REVIEW.md`.

## 14. Papéis

- **Maestro (Antigravity, `/plan`):** escreve `PLAN.md` e `TASKS.md`, lê `STATUS.md` e `REVIEW.md`, libera a próxima fase. Não escreve código.
- **Construtor (OpenCode, Build):** executa só a fase de `TASKS.md`, registra em `STATUS.md`.
- **Revisor (Codex, `/review`):** não edita código. Escreve `REVIEW.md` com APROVADO ou REPROVADO e os problemas com arquivo e linha.

Regras comuns: ler este SPEC antes de alterar; editar só a fase atual; usar só dados fictícios; não adicionar bibliotecas além da seção 9; parar e perguntar em caso de dúvida.

## 15. Design do protótipo

Base: mockup enviado (tema escuro azul-marinho, faixa laranja, aba "Fotos", cartão do arquivo à esquerda, área de arrastar à direita).

**Manter:** tema escuro, faixa laranja, duas colunas, capa maior que os registros, setas nos cantos das miniaturas.

**Corrigir**
- Contraste da aba "Fotos": texto branco ou amarelo claro.
- Textos pequenos: mínimo 14 px nos rótulos, 16 px nas instruções.
- Botão "Carregar arquivo" → "Gerar relatório", habilitado só com modelo e fotos prontos.
- Hover com "editar": texto em faixa legível.

**Adicionar**
- Indicador de etapas: 1 Modelo → 2 Fotos → 3 Gerar.
- Contador "5 de 8 fotos". Acima de 8: barra vermelha e erro antes do bloqueio.
- Estados vazios: caixa tracejada com o nome da posição (Capa, Registro 1 a 7).
- Pré-visualização com a proporção real da área.
- Feedback ao gerar: barra de progresso e "Relatório gerado: <nome>.xlsx".
- Erros em texto claro na tela.
- Layout responsivo.

**Acessibilidade:** contraste mínimo 4,5:1, rótulos nos botões de seta, operação por teclado.

**Fora da v1:** tema claro, arrastar para reordenar, recorte manual, pré-visualização do relatório inteiro.

## 16. Critérios de aceite

- [ ] Gera uma planilha com capa e 7 registros a partir do modelo de exemplo.
- [ ] Capa e registros centralizados nas áreas da seção 5 (conferido no Excel e no LibreOffice).
- [ ] Mais de 8 fotos é bloqueado com mensagem.
- [ ] Posições vazias não geram erro.
- [ ] Teste de preservação (seção 6) passa: abas Dados e Formulário, fórmulas e formatação iguais ao original.
- [ ] Roda em Chrome e Edge sem instalação.
- [ ] Nenhum arquivo sai do computador.
- [ ] `npm test` passa.
# Relatório de ensaio com fotos

Gerador de relatório de ensaio que roda direto no navegador, sem instalação:
o usuário arrasta o modelo `.xlsx` e até 8 fotos, preenche os dados e baixa o
relatório pronto. Todo o processamento acontece localmente — nenhum arquivo é
enviado para servidor.

A especificação completa está em [SPEC.md](SPEC.md). Este repositório contém a
estrutura inicial e os assets fictícios de desenvolvimento; a aplicação ainda
não foi implementada (`index.html` é um placeholder).

## Como abrir o projeto

As dependências de desenvolvimento já estão instaladas em `node_modules/`
(que não é versionado).

1. **Direto no navegador:** dê duplo clique em `index.html` (Chrome ou Edge
   atualizados).
2. **Servidor estático local:**
   ```bash
   npm run dev
   ```
   Depois acesse <http://localhost:5173>.

## Como testar

```bash
npm test
```

Os testes usam [Vitest](https://vitest.dev/) e cobrem apenas as funções puras de
cálculo (`src/layout.js`), sem precisar de navegador. No estado atual existe
apenas um teste placeholder que sempre passa.

O projeto fica em `C:\Users\gabri\OneDrive\Desktop\Projeto SG`, um caminho sem
`#`. (O local anterior, dentro de `#Data`, quebrava o Vite/Vitest.) Última
execução: **1 teste aprovado**.

## Assets fictícios

Todo conteúdo em `assets/` é **fictício** e serve apenas para desenvolvimento.
Nunca coloque fotos, planilhas ou dados reais no repositório.

- `assets/modelo/modelo-exemplo-ficticio.xlsx`: modelo de exemplo com a aba
  **"Relatório de ensaio"**, as 8 áreas da seção 4 da SPEC já mescladas
  (`G10:K22`, `C185:I199`, `C206:I220`, `C221:I235`, `C250:I264`, `C265:I279`,
  `C294:I308`, `C309:I323`) e uma aba **"Dados"** vazia. As dimensões de
  colunas/linhas são as padrão (Calibri 11); **não substitui o modelo real**.
- `assets/fotos-exemplo/`: 8 imagens fictícias — `capa.jpg` e
  `registro-1.jpg` a `registro-7.jpg` — com proporções variadas (retrato,
  paisagem, quadrada) para exercitar o ajuste sem corte.

## Bibliotecas embutidas (`vendor/`)

Versões fixadas, baixadas dos builds oficiais (licença MIT):

| Arquivo | Versão | Tamanho | SHA-256 |
|---|---|---|---|
| `vendor/exceljs.min.js` | 4.4.0 | 947.702 bytes | `7E49DA68588E250DBB8BBA190D2CAA8AB3787CC0284BDA1D8B2F805C4DF742C9` |
| `vendor/jszip.min.js` | 3.10.2 | 97.781 bytes | `7F839B2D4688B845C105EBF5D2F9803075F91EA0FE72BDAAC176C3A04DD3D2C1` |

Elas serão embutidas no `index.html` na etapa de implementação, para o app
funcionar offline.

## Estrutura

```
index.html                          aplicação (placeholder por enquanto)
SPEC.md                             especificação completa (não alterar)
README.md                           este arquivo
AGENTS.md                           regras para agentes de IA
PLAN.md                             plano de etapas
TASKS.md                            etapa atual em detalhe
STATUS.md                           andamento de cada etapa
REVIEW.md                           resultado das revisões
package.json                        scripts de teste e servidor local
package-lock.json                   versões travadas das dependências de dev
src/layout.js                       funções puras de cálculo
tests/layout.test.js                testes das funções puras
assets/modelo/                      modelo .xlsx fictício de exemplo
assets/fotos-exemplo/               8 fotos fictícias de exemplo
vendor/                             ExcelJS e JSZip embutidos (versões fixadas)
docs/decisoes.md                    registro de decisões técnicas
```

## Privacidade e dados

- Use **somente** arquivos fictícios em `assets/`.
- Nunca coloque dados reais, fotos reais ou planilhas da empresa no repositório.
- `assets/dados-reais/` está no `.gitignore` por segurança.

## Requisitos

- Navegador: Chrome ou Edge atualizados.
- Node.js 20+ e npm apenas para desenvolvimento e testes (a aplicação final não
  depende deles).

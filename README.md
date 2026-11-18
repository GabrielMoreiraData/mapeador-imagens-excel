# Relatório de ensaio com fotos

Gerador de relatório de ensaio que roda direto no navegador, sem instalação:
o usuário arrasta o modelo `.xlsx` e até 8 fotos, confere a posição de cada
foto e baixa o relatório pronto. Todo o processamento acontece localmente —
nenhum arquivo é enviado para servidor.

A especificação completa está em [SPEC.md](SPEC.md).

## Como abrir o projeto

1. **Direto no navegador:** dê duplo clique em `index.html` (Chrome ou Edge
   atualizados).
2. **Servidor estático local:**
   ```bash
   npm run dev
   ```
   Depois acesse <http://localhost:5173>.

Não é necessário instalar nada para usar a aplicação. As dependências de
desenvolvimento já estão em `node_modules/` (que não é versionado).

## Como usar

1. **Modelo:** arraste o `.xlsx` ou clique para escolher. O arquivo precisa
   conter a aba **"Relatório de ensaio"**. Nada é gravado no arquivo original.
2. **Fotos:** arraste de 1 a 8 imagens JPG, PNG ou WEBP. A primeira posição é
   a **Capa** e as demais são os **Registros 1 a 7**.
   - Use as setas **←** e **→** de cada miniatura para trocar a foto com a
     posição vizinha (a seta ← do Registro 1 troca com a Capa).
   - Use **×** para remover uma foto. As seguintes sobem de posição e o
     contador é atualizado.
   - Posições sem foto continuam vazias e não geram erro.
3. **Gerar:** com o modelo e pelo menos uma foto, clique em **Gerar
   relatório**. O download de `<nome-do-modelo>-com-fotos.xlsx` começa
   automaticamente, com barra de progresso e mensagem de confirmação.

As fotos são ajustadas sem corte (300 dpi) e centralizadas nas áreas da aba
"Relatório de ensaio". As abas **Dados** e **Formulário**, fórmulas e
formatações existentes são preservadas.

## Como testar

```bash
npm test
```

Os testes usam [Vitest](https://vitest.dev/) e não precisam de navegador:

- `tests/layout.test.js`: funções puras de cálculo (áreas, âncora, ajuste sem
  corte etc.).
- `tests/preservacao.test.js`: insere de 1 a 8 fotos em uma cópia do modelo e
  confere que valores, fórmulas, estilos, mesclagens, dimensões e abas
  permanecem iguais.
- `tests/ordenacao.test.js`: troca e remoção de fotos usadas pelas setas
  (RF06).

O projeto fica em `C:\Users\gabri\OneDrive\Desktop\Projeto SG`, um caminho sem
`#`. (O local anterior, dentro de `#Data`, quebrava o Vite/Vitest.)

## Assets fictícios

Todo conteúdo em `assets/` é **fictício** e serve apenas para desenvolvimento.
Nunca coloque fotos, planilhas ou dados reais no repositório.

- `assets/modelo/modelo-exemplo-ficticio.xlsx`: modelo de exemplo com a aba
  **"Relatório de ensaio"**, as 8 áreas da seção 5 da SPEC já mescladas
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

O ExcelJS é carregado localmente por `index.html`, então a aplicação funciona
offline.

## Estrutura

```
index.html                          aplicação (HTML, CSS e JS embutidos)
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
tests/preservacao.test.js           teste de preservação do modelo
tests/ordenacao.test.js             testes de troca/remoção de fotos
assets/modelo/                      modelo .xlsx fictício de exemplo
assets/fotos-exemplo/               8 fotos fictícias de exemplo
vendor/                             ExcelJS e JSZip embutidos (versões fixadas)
docs/decisoes.md                    registro de decisões técnicas
```

## Privacidade e dados

- Use **somente** arquivos fictícios em `assets/`.
- Nunca coloque dados reais, fotos reais ou planilhas da empresa no repositório.
- `assets/dados-reais/` está no `.gitignore` por segurança.
- A aplicação não faz requisições de rede: lê os arquivos escolhidos pelo
  usuário e gera o download no próprio navegador.

## Requisitos

- Navegador: Chrome ou Edge atualizados.
- Node.js 20+ e npm apenas para desenvolvimento e testes (a aplicação final não
  depende deles).

## Limites conhecidos

- A conversão de colunas/linhas para cm usa a fonte padrão do arquivo. A
  centralização foi validada no Excel com o modelo fictício; o modelo real da
  empresa ainda precisa ser conferido (pendência P1 do SPEC).
- PDF, recorte manual, HEIC, login e histórico estão fora do escopo da v1.

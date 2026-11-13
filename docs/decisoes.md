# Decisões técnicas

Registro cronológico das decisões tomadas no projeto.

## 2026-11-12 — Estrutura inicial

- **Raiz do projeto (atual):** `C:\Users\gabri\OneDrive\Desktop\Projeto SG`.
  A estrutura foi criada inicialmente em `...\#Data\Python\Scripts` (definida
  pelo usuário), sem subdiretório `relatorio-ensaio/`, e movida em 2026-11-12
  (ver último registro). As pastas pessoais preexistentes (`Cisco/`, `Teste/`,
  `Dicionários/`, `Exceções/`, `ExParaRelembrar/`, `.vscode/`) permaneceram em
  `Scripts` e nunca foram tocadas nem versionadas pelo projeto.
- **SPEC:** o arquivo `a.md` foi renomeado para `SPEC.md` sem qualquer edição.
- **Git:** o repositório já existia (branch `master`, sem commits). O commit
  inicial contém somente os arquivos do projeto. A identidade foi configurada
  apenas no repositório como `Gabri <gabri@localhost>`, pois não havia
  configuração global; deve ser trocada para o e-mail real.
- **Diretórios vazios:** mantidos no git via `.gitkeep`. Depois que passaram a
  ter conteúdo, os `.gitkeep` de `assets/` e `vendor/` foram removidos.

## 2026-11-12 — Dependências e bibliotecas

- **Dev dependencies:** `vitest@5.1.0` e `http-server@14.1.1`, travadas em
  `package-lock.json`. A aplicação final não depende de Node.
- **Bibliotecas embutidas:** os builds UMD de `exceljs@4.4.0` e `jszip@3.10.2`
  foram baixados do jsDelivr e gravados em `vendor/`, com SHA-256 registrado no
  README. Escolha por versões fixas atende ao requisito de funcionar offline e
  reproduzir o build.
- **Servidor estático:** `http-server` (script `npm run dev`, porta 5173).

## 2026-11-12 — Assets fictícios

- **`assets/modelo/modelo-exemplo-ficticio.xlsx`:** gerado com ExcelJS apenas
  para desenvolvimento. Contém a aba exata **"Relatório de ensaio"** e as 8
  áreas da seção 4 da SPEC mescladas, além de uma aba **"Dados"** vazia.
  As larguras de coluna e alturas de linha são as padrão do Excel (Calibri 11).
  **Não é o modelo real** e não define nomes/células de campos de dados: esse
  mapeamento não existe na SPEC e continua pendente de confirmação.
- **`assets/fotos-exemplo/`:** 8 JPEGs gerados localmente (formas geométricas e
  texto "IMAGEM FICTICIA"), com proporções variadas, sem qualquer dado real.
  Servem para testar limite de 8 fotos, ordenação e ajuste sem corte.

## 2026-11-12 — Limitação conhecida: `#` no caminho

- O caminho contém `#Data`. Vite/Vitest interpretam `#` como fragmento de URL e
  não conseguem resolver os arquivos de teste (`Cannot find module
  '/tests/layout.test.js'`). Testado com Vitest 5.1.0 e 3.2.4, com junction
  (`mklink /J`), `subst` e `resolve.preserveSymlinks` — nenhum contorno
  funciona, pois o caminho real sempre contém `#`.
- **Teste verificado:** a suíte passa (1 teste) quando executada em uma cópia
  do projeto em caminho sem `#`.
- **Correção definitiva:** renomear a pasta `#Data` (ex.: `Data`) ou mover o
  projeto para um caminho sem `#`. A decisão é do usuário, pois a pasta é
  compartilhada com outros scripts.
- **Resolvido em 2026-11-12:** o projeto foi movido para
  `C:\Users\gabri\OneDrive\Desktop\Projeto SG` (ver registro abaixo).

## 2026-11-12 — Projeto movido para `Projeto SG`

- **Novo caminho:** `C:\Users\gabri\OneDrive\Desktop\Projeto SG`, sem `#`.
  Isso elimina a limitação do Vite/Vitest.
- **Movidos:** todos os arquivos e diretórios do projeto, incluindo `.git`,
  `node_modules/`, `assets/`, `vendor/`, `src/`, `tests/` e `docs/`.
- **Permaneceu em `Scripts`:** apenas as pastas pessoais preexistentes
  (`.vscode/`, `Cisco/`, `Teste/`, `Dicionários/`, `Exceções/`,
  `ExParaRelembrar/`). `Scripts` deixou de ser repositório git; o histórico
  (2 commits) foi preservado junto com o projeto.
- **Validação:** `npm test` no novo local — 1 teste aprovado.
- `SPEC.md` continua sem alterações.

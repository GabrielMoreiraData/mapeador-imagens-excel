import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  AREAS_FOTO,
  calcularAncora,
  letraParaIndice,
} from "../src/layout.js";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const CAMINHO_EXCELJS = path.join(RAIZ, "vendor", "exceljs.min.js");
const CAMINHO_MODELO = path.join(RAIZ, "assets", "modelo", "modelo-exemplo-ficticio.xlsx");
const PASTA_FOTOS = path.join(RAIZ, "assets", "fotos-exemplo");
const ABA = "Relatório de ensaio";

const TAMANHO_CAPA_CM = { largura: 6.8, altura: 6.5 };
const TAMANHO_REGISTRO_CM = { largura: 9.6, altura: 7.2 };

const NOMES_FOTOS = [
  "capa.jpg",
  "registro-1.jpg",
  "registro-2.jpg",
  "registro-3.jpg",
  "registro-4.jpg",
  "registro-5.jpg",
  "registro-6.jpg",
  "registro-7.jpg",
];

/**
 * Carrega o ExcelJS de `vendor/` dentro de um contexto vm, do mesmo jeito que
 * a página faz via <script>. O bundle é UMD e depende de Buffer/fs no Node.
 */
function carregarExcelJS() {
  const contexto = {
    console,
    setTimeout,
    clearTimeout,
    localStorage: undefined,
    document: undefined,
    navigator: undefined,
    fs,
    Buffer,
    Uint8Array,
    ArrayBuffer,
    DataView,
  };

  contexto.window = contexto;
  contexto.self = contexto;
  contexto.globalThis = contexto;

  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(CAMINHO_EXCELJS, "utf8"), contexto, {
    filename: "exceljs.min.js",
  });

  return contexto.ExcelJS;
}

const ExcelJS = carregarExcelJS();

/** Carrega um workbook a partir de bytes, sem reutilizar o buffer. */
async function carregarWorkbook(bytes) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes));
  return workbook;
}

/** Lê as primeiras `quantidade` fotos fictícias, na ordem capa + registros. */
function lerFotos(quantidade) {
  return NOMES_FOTOS.slice(0, quantidade).map((nome) =>
    fs.readFileSync(path.join(PASTA_FOTOS, nome))
  );
}

/** Largura de coluna em pixels, com a fonte padrão Calibri 11. */
function gradeDaArea(planilha, area) {
  const larguraPadrao = planilha.properties.defaultColWidth || 8.43;
  const alturaPadrao = planilha.properties.defaultRowHeight || 15;
  const colunas = [];
  const linhas = [];

  for (
    let coluna = letraParaIndice(area.colunaInicio);
    coluna <= letraParaIndice(area.colunaFim);
    coluna += 1
  ) {
    const largura = planilha.getColumn(coluna + 1).width;
    const caracteres = largura == null ? larguraPadrao : largura;
    colunas.push(Math.round(caracteres * 7) + 5);
  }

  for (let linha = area.linhaInicio; linha <= area.linhaFim; linha += 1) {
    const altura = planilha.getRow(linha).height;
    const pontos = altura == null ? alturaPadrao : altura;
    linhas.push(Math.round((pontos * 96) / 72));
  }

  return { colunas, linhas };
}

/** Mede a área real da planilha em cm a partir da grade em pixels. */
function areaEmCm(grade) {
  const PX_POR_CM = 96 / 2.54;
  return {
    larguraCm: grade.colunas.reduce((total, largura) => total + largura, 0) / PX_POR_CM,
    alturaCm: grade.linhas.reduce((total, altura) => total + altura, 0) / PX_POR_CM,
  };
}

/**
 * Mesma inserção de `montarRelatorio()` em index.html: âncora/deslocamento
 * centralizados na área real e extensão em pixels de 96 dpi.
 */
function inserirFotos(workbook, fotos) {
  const planilha = workbook.getWorksheet(ABA);

  fotos.forEach((foto, indice) => {
    const area = AREAS_FOTO[indice];
    const grade = gradeDaArea(planilha, area);
    const ancora = calcularAncora(
      { ...area, ...areaEmCm(grade) },
      indice === 0 ? TAMANHO_CAPA_CM : TAMANHO_REGISTRO_CM,
      grade
    );
    const imageId = workbook.addImage({ buffer: foto, extension: "jpeg" });

    planilha.addImage(imageId, {
      tl: {
        nativeCol: ancora.coluna,
        nativeColOff: ancora.deslocamentoXEmu,
        nativeRow: ancora.linha,
        nativeRowOff: ancora.deslocamentoYEmu,
      },
      ext: { width: ancora.larguraPx, height: ancora.alturaPx },
      editAs: "oneCell",
    });
  });
}

/** Carrega o modelo, insere as fotos, grava e relê o resultado. */
async function gerarSaida(bytesModelo, fotos) {
  const workbook = await carregarWorkbook(bytesModelo);
  inserirFotos(workbook, fotos);
  return carregarWorkbook(await workbook.xlsx.writeBuffer());
}

const normalizar = (valor) =>
  valor === undefined ? null : JSON.parse(JSON.stringify(valor));

/**
 * Retrato completo de uma aba: células (valor/fórmula, formato, borda,
 * preenchimento, alinhamento, proteção e comentário), mesclagens, larguras
 * de coluna e alturas de linha. Imagens são comparadas à parte.
 */
function retratoPlanilha(planilha) {
  const celulas = [];

  planilha.eachRow({ includeEmpty: false }, (linha) => {
    linha.eachCell({ includeEmpty: false }, (celula) => {
      celulas.push({
        endereco: celula.address,
        valor: normalizar(celula.value),
        formula: celula.formula ?? null,
        resultado: normalizar(celula.result),
        formato: celula.numFmt ?? null,
        fonte: normalizar(celula.font),
        preenchimento: normalizar(celula.fill),
        borda: normalizar(celula.border),
        alinhamento: normalizar(celula.alignment),
        protecao: normalizar(celula.protection),
        comentario: normalizar(celula.note),
      });
    });
  });

  const colunas = [];
  for (let indice = 1; indice <= planilha.columnCount; indice += 1) {
    const coluna = planilha.getColumn(indice);
    colunas.push({
      letra: coluna.letter,
      largura: coluna.width ?? null,
      oculta: Boolean(coluna.hidden),
      nivel: coluna.outlineLevel ?? 0,
    });
  }

  const linhas = [];
  for (let indice = 1; indice <= planilha.rowCount; indice += 1) {
    const linha = planilha.getRow(indice);
    linhas.push({
      numero: indice,
      altura: linha.height ?? null,
      oculta: Boolean(linha.hidden),
      nivel: linha.outlineLevel ?? 0,
    });
  }

  return {
    nome: planilha.name,
    mesclagens: [...(planilha.model.merges || [])].sort(),
    colunas,
    linhas,
    celulas,
    larguraPadrao: planilha.properties.defaultColWidth ?? null,
    alturaPadrao: planilha.properties.defaultRowHeight ?? null,
  };
}

/** Compara todas as abas e valida a contagem de imagens por aba. */
function compararWorkbooks(entrada, saida, quantidadeFotos) {
  expect(saida.worksheets.map((aba) => aba.name)).toEqual(
    entrada.worksheets.map((aba) => aba.name)
  );

  for (const planilhaEntrada of entrada.worksheets) {
    const planilhaSaida = saida.getWorksheet(planilhaEntrada.name);

    expect(planilhaSaida, `aba ausente na saída: ${planilhaEntrada.name}`).toBeTruthy();
    expect(retratoPlanilha(planilhaSaida)).toEqual(retratoPlanilha(planilhaEntrada));

    if (planilhaEntrada.name === ABA) {
      expect(planilhaSaida.getImages()).toHaveLength(quantidadeFotos);
    } else {
      expect(planilhaSaida.getImages()).toHaveLength(0);
    }
  }

  // Nenhuma mídia duplicada: uma imagem de saída por foto inserida.
  expect(saida.media).toHaveLength(quantidadeFotos);
}

/** Modelo de exemplo com fórmulas e formatação que o arquivo original não tem. */
async function modeloEnriquecido() {
  const bruto = await carregarWorkbook(fs.readFileSync(CAMINHO_MODELO));
  const planilha = bruto.getWorksheet(ABA);

  planilha.getCell("B2").value = { formula: "SUM(1,2)", result: 3 };
  planilha.getCell("B3").value = { formula: "ROUND(10/3,2)", result: 3.33 };
  planilha.getCell("B4").value = "Texto fictício de teste";
  planilha.getCell("B4").font = { bold: true, color: { argb: "FFFF0000" } };
  planilha.getCell("B4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00FF00" },
  };
  planilha.getCell("B4").border = { top: { style: "double" } };
  planilha.getCell("B4").alignment = { horizontal: "center" };
  planilha.getColumn("C").width = 14.29;
  planilha.getRow(30).height = 30;

  const normalizado = Buffer.from(await bruto.xlsx.writeBuffer());
  return { bytes: normalizado, workbook: await carregarWorkbook(normalizado) };
}

describe("preservação do modelo", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "preserva todas as abas com %i foto(s) e insere só no Relatório de ensaio",
    async (quantidade) => {
      const entrada = await carregarWorkbook(fs.readFileSync(CAMINHO_MODELO));
      const saida = await gerarSaida(fs.readFileSync(CAMINHO_MODELO), lerFotos(quantidade));

      compararWorkbooks(entrada, saida, quantidade);

      const planilha = saida.getWorksheet(ABA);
      const imagens = planilha.getImages();

      expect(new Set(imagens.map((imagem) => imagem.imageId)).size).toBe(quantidade);
      expect(saida.getWorksheet("Dados").getImages()).toHaveLength(0);

      for (const imagem of imagens) {
        expect(imagem.range.ext.width).toBeGreaterThan(0);
        expect(imagem.range.ext.height).toBeGreaterThan(0);
      }
    },
    20000
  );

  it(
    "preserva fórmulas, formatações, larguras e alturas de um modelo enriquecido",
    async () => {
      const { bytes, workbook: entrada } = await modeloEnriquecido();
      const planilhaEntrada = entrada.getWorksheet(ABA);

      expect(planilhaEntrada.getCell("B2").value).toMatchObject({ formula: "SUM(1,2)" });
      expect(planilhaEntrada.getCell("B3").value).toMatchObject({ formula: "ROUND(10/3,2)" });
      expect(planilhaEntrada.getColumn("C").width).toBe(14.29);
      expect(planilhaEntrada.getRow(30).height).toBe(30);

      const saida = await gerarSaida(bytes, lerFotos(3));
      compararWorkbooks(entrada, saida, 3);

      const planilhaSaida = saida.getWorksheet(ABA);

      expect(planilhaSaida.getCell("B2").value).toMatchObject({
        formula: "SUM(1,2)",
        result: 3,
      });
      expect(planilhaSaida.getCell("B3").value).toMatchObject({
        formula: "ROUND(10/3,2)",
        result: 3.33,
      });
      expect(planilhaSaida.getColumn("C").width).toBe(14.29);
      expect(planilhaSaida.getRow(30).height).toBe(30);
      expect(planilhaSaida.getCell("B4").font).toMatchObject({ bold: true });
      expect(planilhaSaida.getCell("B4").fill).toMatchObject({ pattern: "solid" });
    },
    20000
  );

  it("mantém as 8 áreas de foto e suas mesclagens intactas", async () => {
    const entrada = await carregarWorkbook(fs.readFileSync(CAMINHO_MODELO));
    const saida = await gerarSaida(fs.readFileSync(CAMINHO_MODELO), lerFotos(8));

    const mesclagensEntrada = [...entrada.getWorksheet(ABA).model.merges].sort();
    const mesclagensSaida = [...saida.getWorksheet(ABA).model.merges].sort();

    expect(mesclagensSaida).toEqual(mesclagensEntrada);
    expect(mesclagensSaida).toEqual(
      [
        "G10:K22",
        "C185:I199",
        "C206:I220",
        "C221:I235",
        "C250:I264",
        "C265:I279",
        "C294:I308",
        "C309:I323",
      ].sort()
    );
  });
});

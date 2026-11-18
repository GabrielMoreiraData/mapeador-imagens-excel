import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { AREAS_FOTO, letraParaIndice } from "../src/layout.js";

// A conversão de colunas/linhas e a ancoragem vivem dentro da IIFE de
// index.html (a página roda em file://). O bloco é extraído e avaliado aqui
// para testar exatamente o código de produção que posiciona as fotos.
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const HTML = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const BLOCO = HTML.match(/\/\* GRADE_INICIO \*\/([\s\S]*?)\/\* GRADE_FIM \*\//);

if (!BLOCO) {
  throw new Error("Bloco GRADE_INICIO/FIM não encontrado em index.html.");
}

/** Valor de uma constante `const NOME = ...;` declarada em index.html. */
function constanteDoHtml(nome) {
  const encontrada = HTML.match(new RegExp(`const ${nome} = ([^;]+);`));

  if (!encontrada) {
    throw new Error(`Constante ${nome} não encontrada em index.html.`);
  }

  return new Function(`return (${encontrada[1]});`)();
}

const PX_POR_CM = constanteDoHtml("PX_POR_CM");
const EMU_POR_PX = constanteDoHtml("EMU_POR_PX");

const {
  alturaLinhaEmPixels,
  areaEmCm,
  calcularAncora,
  gradeDaArea,
  larguraColunaArmazenadaEmPixels,
  larguraColunaEmPixels,
} = new Function(
  "PX_POR_CM",
  "EMU_POR_PX",
  `${BLOCO[1]}
  return {
    alturaLinhaEmPixels,
    areaEmCm,
    calcularAncora,
    gradeDaArea,
    larguraColunaArmazenadaEmPixels,
    larguraColunaEmPixels,
  };`
)(PX_POR_CM, EMU_POR_PX);

/** Carrega o ExcelJS de `vendor/` como a página faz via <script>. */
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
  vm.runInContext(fs.readFileSync(path.join(RAIZ, "vendor", "exceljs.min.js"), "utf8"), contexto, {
    filename: "exceljs.min.js",
  });

  return contexto.ExcelJS;
}

const ExcelJS = carregarExcelJS();

const CAMINHO_SANITIZADO = path.join(RAIZ, "assets", "modelo", "ori - Copia.xlsx");
const CAMINHO_EXEMPLO = path.join(RAIZ, "assets", "modelo", "modelo-exemplo-ficticio.xlsx");
const ABA = "Relatório de ensaio";

/** Modelo sanitizado (fictício) e modelo de exemplo, carregados uma vez. */
let modelosCarregados;

function modelos() {
  if (!modelosCarregados) {
    modelosCarregados = (async () => {
      const carregar = async (caminho) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fs.readFileSync(caminho));
        return workbook.getWorksheet(ABA);
      };

      return {
        sanitizado: await carregar(CAMINHO_SANITIZADO),
        exemplo: await carregar(CAMINHO_EXEMPLO),
      };
    })();
  }

  return modelosCarregados;
}

/** Tamanho final da foto na posição (seção 5 do SPEC). */
const tamanhoFoto = (indice) =>
  indice === 0 ? { largura: 6.8, altura: 6.5 } : { largura: 9.6, altura: 7.2 };

/** Margens da foto em relação à área, em pixels, a partir da âncora gravada. */
function margensDaFoto(area, foto, grade, ancora) {
  const colunaRelativa = ancora.coluna - letraParaIndice(area.colunaInicio);
  const linhaRelativa = ancora.linha - (area.linhaInicio - 1);
  const somar = (valores) => valores.reduce((total, valor) => total + valor, 0);

  const esquerda =
    somar(grade.colunas.slice(0, colunaRelativa)) + ancora.deslocamentoXEmu / EMU_POR_PX;
  const topo =
    somar(grade.linhas.slice(0, linhaRelativa)) + ancora.deslocamentoYEmu / EMU_POR_PX;

  return {
    esquerda,
    direita: somar(grade.colunas) - esquerda - ancora.larguraPx,
    topo,
    base: somar(grade.linhas) - topo - ancora.alturaPx,
    fotoLarguraPx: ancora.larguraPx,
    fotoAlturaPx: ancora.alturaPx,
    alvoLarguraPx: foto.largura * PX_POR_CM,
    alvoAlturaPx: foto.altura * PX_POR_CM,
  };
}

describe("conversão de largura de coluna (unidade gravada no .xlsx)", () => {
  it("distingue a largura da interface (8,43) da largura gravada", () => {
    // 8,43 é a largura que aparece na interface do Excel para a coluna padrão.
    expect(larguraColunaEmPixels(8.43)).toBe(64);
    // A mesma coluna é gravada como 9,140625 no XML e também ocupa 64 px.
    expect(larguraColunaArmazenadaEmPixels(9.140625)).toBe(64);
  });

  it("reproduz a diferença de 5 px por coluna medida no Excel 16", () => {
    // Larguras reais da aba "Relatório de ensaio" do modelo sanitizado.
    const gravadas = [9.42578125, 8.7109375, 9.42578125, 8.5703125, 8.5703125, 8.5703125, 9.5703125];
    const medidasNoExcel = [66, 61, 66, 60, 60, 60, 67];

    const convertidas = gravadas.map((largura) => larguraColunaArmazenadaEmPixels(largura));

    expect(convertidas).toEqual(medidasNoExcel);

    // A regra antiga lia a largura gravada como se fosse a da interface e
    // somava 5 px por coluna: 475 px em vez dos 440 px medidos no Excel.
    const antigas = gravadas.map((largura) => larguraColunaEmPixels(largura));

    expect(antigas.map((px, indice) => px - convertidas[indice])).toEqual(Array(7).fill(5));
    expect(antigas.reduce((total, px) => total + px, 0)).toBe(475);
    expect(convertidas.reduce((total, px) => total + px, 0)).toBe(440);
  });
});

describe("grade real do modelo sanitizado", () => {
  it("mede a largura dos registros em 11,642 cm, como o Excel", async () => {
    const { sanitizado } = await modelos();
    const grade = gradeDaArea(sanitizado, AREAS_FOTO[1]);

    expect(grade.colunas).toEqual([66, 61, 66, 60, 60, 60, 67]);
    expect(areaEmCm(grade).larguraCm).toBeCloseTo(11.642, 3);

    // A estimativa antiga (12,568 cm) era 0,926 cm maior que a área real.
    const antiga = grade.colunas.reduce((total, _, indice) => {
      const largura = sanitizado.getColumn(letraParaIndice("C") + indice + 1).width;
      return total + larguraColunaEmPixels(largura);
    }, 0);

    expect(antiga / PX_POR_CM).toBeCloseTo(12.568, 3);
    expect(antiga - grade.colunas.reduce((total, px) => total + px, 0)).toBe(35);
  });

  it("zera as linhas ocultas 13 a 15 e deixa a capa com 7,25 cm", async () => {
    const { sanitizado } = await modelos();
    const grade = gradeDaArea(sanitizado, AREAS_FOTO[0]);

    // Grade G10:K22: as linhas 13, 14 e 15 estão ocultas no modelo.
    expect(grade.linhas.slice(3, 6)).toEqual([0, 0, 0]);
    expect(grade.linhas).toEqual([20, 26, 26, 0, 0, 0, 30, 26, 30, 30, 30, 30, 26]);
    expect(areaEmCm(grade).alturaCm).toBeCloseTo(7.25, 3);

    // Sem descontar as ocultas a capa parecia ter 338 px (8,943 cm).
    const comOcultas = [20, 26, 26, 26, 26, 12, 30, 26, 30, 30, 30, 30, 26];

    expect(comOcultas.reduce((total, px) => total + px, 0)).toBe(338);
    expect(338 / PX_POR_CM).toBeCloseTo(8.943, 3);
  });

  it("reproduz a assimetria medida no Excel antes da correção", async () => {
    const { sanitizado } = await modelos();
    const area = AREAS_FOTO[1];
    const foto = tamanhoFoto(1);
    const larguraAntigaPx = 475; // soma da regra antiga (12,568 cm)
    const larguraExcelPx = gradeDaArea(sanitizado, area).colunas.reduce(
      (total, px) => total + px,
      0
    );
    const fotoPx = Math.round(foto.largura * PX_POR_CM); // 363 px
    const deslocamentoAntigoPx = ((larguraAntigaPx - foto.largura * PX_POR_CM) / 2);

    const esquerda = deslocamentoAntigoPx / PX_POR_CM;
    const direita = (larguraExcelPx - deslocamentoAntigoPx - fotoPx) / PX_POR_CM;

    // Valores medidos no Excel 16: E=1,484 cm e D=0,553 cm.
    expect(esquerda).toBeCloseTo(1.484, 2);
    expect(direita).toBeCloseTo(0.553, 2);
    expect(esquerda - direita).toBeGreaterThan(0.9);
  });
});

describe("centralização na grade do Excel", () => {
  it.each(AREAS_FOTO.map((area, indice) => ({ ...area, indice })))(
    "centraliza $posicao em $colunaInicio$linhaInicio:$colunaFim$linhaFim",
    async (area) => {
      const { sanitizado } = await modelos();
      const indice = area.indice;
      const grade = gradeDaArea(sanitizado, area);
      const foto = tamanhoFoto(indice);
      const ancora = calcularAncora({ ...area, ...areaEmCm(grade) }, foto, grade);
      const margens = margensDaFoto(area, foto, grade, ancora);

      // Tolerância de 1 px (0,026 cm) para o arredondamento de EMU/pixels.
      expect(Math.abs(margens.esquerda - margens.direita)).toBeLessThanOrEqual(1);
      expect(Math.abs(margens.topo - margens.base)).toBeLessThanOrEqual(1);

      // A foto cabe inteira na área visível.
      expect(margens.esquerda).toBeGreaterThanOrEqual(0);
      expect(margens.direita).toBeGreaterThanOrEqual(0);
      expect(margens.topo).toBeGreaterThanOrEqual(0);
      expect(margens.base).toBeGreaterThanOrEqual(0);

      // A âncora nunca cai em uma linha oculta da área.
      expect(ancora.linha).toBeGreaterThanOrEqual(area.linhaInicio - 1);
      expect(ancora.linha).toBeLessThanOrEqual(area.linhaFim - 1);
      expect(sanitizado.getRow(ancora.linha + 1).hidden).toBe(false);
    }
  );
});

describe("modelo sem larguras gravadas (colunas padrão do Excel)", () => {
  it("usa 64 px por coluna e 20 px por linha quando o XML não traz medidas", async () => {
    const { exemplo } = await modelos();
    const grade = gradeDaArea(exemplo, AREAS_FOTO[0]);

    expect(exemplo.properties.defaultColWidth).toBeUndefined();
    expect(grade.colunas).toEqual(Array(5).fill(64));
    expect(grade.linhas).toEqual(Array(13).fill(20));
    expect(areaEmCm(grade).larguraCm).toBeCloseTo(8.467, 3);
    expect(areaEmCm(grade).alturaCm).toBeCloseTo(6.879, 3);
  });

  it("trata coluna oculta como 0 px", () => {
    const planilha = {
      properties: { defaultRowHeight: 15 },
      getColumn: (numero) => ({ hidden: numero === 2 }),
      getRow: () => ({ height: 15, hidden: false }),
    };
    const area = { colunaInicio: "B", colunaFim: "C", linhaInicio: 1, linhaFim: 1 };
    const grade = gradeDaArea(planilha, area);

    expect(grade.colunas).toEqual([0, 64]);
    expect(grade.linhas).toEqual([20]);
  });
});

describe("funções auxiliares de medida", () => {
  it("mantém a conversão de altura em pontos para pixels de 96 dpi", () => {
    expect(alturaLinhaEmPixels(15)).toBe(20);
    expect(alturaLinhaEmPixels(19.5)).toBe(26);
    expect(alturaLinhaEmPixels(14.25)).toBe(19);
  });
});

// funções puras de cálculo (E0)

/** Tipos de imagem aceitos (RF03). */
const TIPOS_ACEITOS = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Limite de fotos por relatório (RF04): capa + 7 registros. */
const LIMITE_PADRAO = 8;

const ERRO_MAXIMO = "Máximo de 8 fotos. Envie até 8 imagens.";
const ERRO_FORMATO = "Formato não aceito: use JPG, PNG ou WEBP.";

/**
 * Arredonda medidas em cm para 4 casas decimais (precisão de 0,0001 cm).
 * Evita ruído de ponto flutuante, como 6.800000000000001.
 */
function arredondar(valor) {
  return Math.round(valor * 10000) / 10000;
}

/**
 * Valida a lista de fotos antes de carregar.
 * @param {Array<{ nome?: string, tipo: string }>} lista
 * @param {number} [limite=8]
 * @returns {{ ok: true } | { ok: false, erro: string }}
 */
export function validarFotos(lista, limite = LIMITE_PADRAO) {
  const fotos = Array.isArray(lista) ? lista : [];

  if (fotos.length > limite) {
    return { ok: false, erro: ERRO_MAXIMO };
  }

  const temFormatoInvalido = fotos.some((foto) => !TIPOS_ACEITOS.has(foto?.tipo));
  if (temFormatoInvalido) {
    return { ok: false, erro: ERRO_FORMATO };
  }

  return { ok: true };
}

/**
 * Ajusta a foto para caber inteira na área alvo, sem cortar e sem distorcer.
 * A escala é a mesma nos dois eixos, então a proporção original é mantida.
 * A escala é limitada a 1: imagens que já cabem na área mantêm o tamanho
 * original e não são ampliadas (RF08) — as sobras viram faixas brancas.
 * @returns {{ largura: number, altura: number }} medidas em cm, nunca maiores que a área alvo
 */
export function ajustarSemCorte(larguraOrig, alturaOrig, larguraAlvo, alturaAlvo) {
  const escala = Math.min(larguraAlvo / larguraOrig, alturaAlvo / alturaOrig, 1);

  return {
    largura: Math.min(larguraAlvo, arredondar(larguraOrig * escala)),
    altura: Math.min(alturaAlvo, arredondar(alturaOrig * escala)),
  };
}

/**
 * Centraliza a foto dentro da área da planilha (seção 5 do SPEC).
 * @param {{ xCm: number, yCm: number, larguraCm: number, alturaCm: number }} area
 * @param {{ largura: number, altura: number }} tamanhoFotoCm
 * @returns {{ xCm: number, yCm: number }}
 */
export function calcularPosicao(area, tamanhoFotoCm) {
  return {
    xCm: arredondar(area.xCm + (area.larguraCm - tamanhoFotoCm.largura) / 2),
    yCm: arredondar(area.yCm + (area.alturaCm - tamanhoFotoCm.altura) / 2),
  };
}

/**
 * Converte centímetros em pixels na resolução informada (RF07).
 * 1 polegada = 2,54 cm, então 300 dpi = 300 / 2,54 px por cm (≈ 118,11).
 * @param {number} cm
 * @param {number} [dpi=300]
 * @returns {number} pixels arredondados
 */
export function cmParaPixels(cm, dpi = 300) {
  return Math.round((cm / 2.54) * dpi);
}

/**
 * Tamanho do canvas (em pixels) para uma foto impressa no tamanho final em cm.
 * Capa 6,8 × 6,5 cm → 803 × 768 px; registros 9,6 × 7,2 cm → 1134 × 850 px.
 * @param {{ largura: number, altura: number }} tamanhoCm
 * @param {number} [dpi=300]
 * @returns {{ largura: number, altura: number }}
 */
export function tamanhoEmPixels(tamanhoCm, dpi = 300) {
  return {
    largura: cmParaPixels(tamanhoCm.largura, dpi),
    altura: cmParaPixels(tamanhoCm.altura, dpi),
  };
}

/**
 * Escala do ajuste "contain" em pixels (RF08).
 * Sem o limite de 1 de `ajustarSemCorte`: aqui a imagem pode ser ampliada
 * para alcançar a resolução final de 300 dpi.
 */
export function escalaContida(larguraOrig, alturaOrig, larguraAlvo, alturaAlvo) {
  return Math.min(larguraAlvo / larguraOrig, alturaAlvo / alturaOrig);
}

/** Pixel de 96 dpi, unidade aceita por `ext` no ExcelJS. */
export const PX_POR_CM = 96 / 2.54;

/**
 * EMU por pixel de 96 dpi (1 polegada = 914 400 EMU / 96).
 * 1 cm = 360 000 EMU, então 1 cm ≈ 37,795 px.
 */
export const EMU_POR_PX = 9525;

/**
 * Áreas confirmadas da aba "Relatório de ensaio" (seção 5 do SPEC).
 * Cada área começa na célula superior esquerda e termina na inferior direita.
 */
export const AREAS_FOTO = Object.freeze(
  [
    {
      posicao: "Capa",
      colunaInicio: "G",
      linhaInicio: 10,
      colunaFim: "K",
      linhaFim: 22,
      larguraCm: 8.84,
      alturaCm: 8.94,
    },
    {
      posicao: "Registro 1",
      colunaInicio: "C",
      linhaInicio: 185,
      colunaFim: "I",
      linhaFim: 199,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
    {
      posicao: "Registro 2",
      colunaInicio: "C",
      linhaInicio: 206,
      colunaFim: "I",
      linhaFim: 220,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
    {
      posicao: "Registro 3",
      colunaInicio: "C",
      linhaInicio: 221,
      colunaFim: "I",
      linhaFim: 235,
      larguraCm: 12.44,
      alturaCm: 7.49,
    },
    {
      posicao: "Registro 4",
      colunaInicio: "C",
      linhaInicio: 250,
      colunaFim: "I",
      linhaFim: 264,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
    {
      posicao: "Registro 5",
      colunaInicio: "C",
      linhaInicio: 265,
      colunaFim: "I",
      linhaFim: 279,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
    {
      posicao: "Registro 6",
      colunaInicio: "C",
      linhaInicio: 294,
      colunaFim: "I",
      linhaFim: 308,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
    {
      posicao: "Registro 7",
      colunaInicio: "C",
      linhaInicio: 309,
      colunaFim: "I",
      linhaFim: 323,
      larguraCm: 12.44,
      alturaCm: 7.54,
    },
  ].map((area) => Object.freeze(area))
);

/**
 * Converte a letra da coluna (A, G, AA) no índice 0-based do ExcelJS.
 * @param {string} letra
 * @returns {number}
 */
export function letraParaIndice(letra) {
  const texto = String(letra).trim().toUpperCase();

  if (!/^[A-Z]+$/.test(texto)) {
    throw new Error(`Coluna inválida: ${letra}`);
  }

  let indice = 0;

  for (const caractere of texto) {
    indice = indice * 26 + (caractere.charCodeAt(0) - 64);
  }

  return indice - 1;
}

/**
 * Largura de uma coluna em pixels, com a fonte padrão Calibri 11 (MDW = 7 px).
 * Aproximação usada pelo Excel para a unidade de largura de coluna (seção 5).
 * @param {number} larguraEmCaracteres
 * @returns {number}
 */
export function larguraColunaEmPixels(larguraEmCaracteres) {
  return Math.round(larguraEmCaracteres * 7) + 5;
}

/**
 * Altura de uma linha em pixels de 96 dpi (o Excel guarda a altura em pontos).
 * @param {number} alturaEmPontos
 * @returns {number}
 */
export function alturaLinhaEmPixels(alturaEmPontos) {
  return Math.round((alturaEmPontos * 96) / 72);
}

/**
 * Âncora do ExcelJS que centraliza a foto na área da planilha (seção 5).
 * O ponto centralizado é convertido de cm para pixels e depois percorre a
 * grade real da planilha, porque o Excel limita o deslocamento ao tamanho da
 * célula: o deslocamento final é sempre menor que a coluna/linha da âncora.
 * A extensão da imagem é em pixels de 96 dpi.
 * @param {{ colunaInicio: string, linhaInicio: number, larguraCm: number, alturaCm: number }} area
 * @param {{ largura: number, altura: number }} tamanhoFotoCm
 * @param {{ colunas: number[], linhas: number[] }} grade larguras/alturas em
 *   pixels, a partir da primeira coluna/linha da área
 * @returns {{ coluna: number, linha: number, deslocamentoXEmu: number,
 *   deslocamentoYEmu: number, larguraPx: number, alturaPx: number }}
 */
export function calcularAncora(area, tamanhoFotoCm, grade) {
  let xPx = ((area.larguraCm - tamanhoFotoCm.largura) / 2) * PX_POR_CM;
  let yPx = ((area.alturaCm - tamanhoFotoCm.altura) / 2) * PX_POR_CM;
  let coluna = letraParaIndice(area.colunaInicio);
  let linha = area.linhaInicio - 1;

  for (const largura of grade.colunas) {
    if (xPx < largura) {
      break;
    }
    xPx -= largura;
    coluna += 1;
  }

  for (const altura of grade.linhas) {
    if (yPx < altura) {
      break;
    }
    yPx -= altura;
    linha += 1;
  }

  return {
    coluna,
    linha,
    deslocamentoXEmu: Math.round(xPx * EMU_POR_PX),
    deslocamentoYEmu: Math.round(yPx * EMU_POR_PX),
    larguraPx: Math.round(tamanhoFotoCm.largura * PX_POR_CM),
    alturaPx: Math.round(tamanhoFotoCm.altura * PX_POR_CM),
  };
}


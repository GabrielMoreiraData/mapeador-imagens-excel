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

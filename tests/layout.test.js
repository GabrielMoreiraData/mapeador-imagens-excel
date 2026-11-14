import { describe, expect, it } from "vitest";

import {
  ajustarSemCorte,
  alturaLinhaEmPixels,
  AREAS_FOTO,
  calcularAncora,
  calcularPosicao,
  cmParaPixels,
  EMU_POR_PX,
  escalaContida,
  larguraColunaEmPixels,
  letraParaIndice,
  PX_POR_CM,
  tamanhoEmPixels,
  validarFotos,
} from "../src/layout.js";

/** Monta uma lista de fotos fictícias com o tipo informado. */
function fotos(quantidade, tipo = "image/jpeg") {
  return Array.from({ length: quantidade }, (_, indice) => ({
    nome: `foto-${indice + 1}.jpg`,
    tipo,
  }));
}

describe("validarFotos", () => {
  it("aceita lista vazia", () => {
    expect(validarFotos([])).toEqual({ ok: true });
  });

  it("aceita 8 fotos válidas", () => {
    const lista = [
      ...fotos(3, "image/jpeg"),
      ...fotos(3, "image/png"),
      ...fotos(2, "image/webp"),
    ];

    expect(validarFotos(lista)).toEqual({ ok: true });
  });

  it("bloqueia 9 fotos com mensagem do limite de 8", () => {
    const resultado = validarFotos(fotos(9));

    expect(resultado.ok).toBe(false);
    expect(resultado.erro).toContain("8");
  });

  it("recusa formato não aceito (PDF)", () => {
    const resultado = validarFotos([{ nome: "documento.pdf", tipo: "application/pdf" }]);

    expect(resultado.ok).toBe(false);
    expect(resultado.erro).toContain("JPG, PNG ou WEBP");
  });

  it("respeita o limite informado", () => {
    expect(validarFotos(fotos(3), 2).ok).toBe(false);
    expect(validarFotos(fotos(2), 2).ok).toBe(true);
  });
});

describe("ajustarSemCorte", () => {
  it("cabe uma imagem paisagem em área quadrada sem cortar", () => {
    // 10 × 5 cm na capa (6,8 × 6,5 cm): escala 0,68.
    const tamanho = ajustarSemCorte(10, 5, 6.8, 6.5);

    expect(tamanho).toEqual({ largura: 6.8, altura: 3.4 });
    expect(tamanho.largura).toBeLessThanOrEqual(6.8);
    expect(tamanho.altura).toBeLessThanOrEqual(6.5);
  });

  it("não estica imagem menor que a área: mantém o tamanho original", () => {
    // 3 × 2 cm em 9,6 × 7,2 cm: já cabe, então o tamanho final é o de origem.
    const tamanho = ajustarSemCorte(3, 2, 9.6, 7.2);

    expect(tamanho).toEqual({ largura: 3, altura: 2 });
    expect(tamanho.largura).toBeLessThanOrEqual(9.6);
    expect(tamanho.altura).toBeLessThanOrEqual(7.2);
    expect(tamanho.largura / tamanho.altura).toBeCloseTo(3 / 2, 6);
  });

  it("limita pelo eixo mais restritivo em área alta", () => {
    // 5 × 10 cm na capa (6,8 × 6,5 cm): a altura é o limite (escala 0,65).
    expect(ajustarSemCorte(5, 10, 6.8, 6.5)).toEqual({ largura: 3.25, altura: 6.5 });
  });
});

describe("calcularPosicao", () => {
  const capa = { xCm: 0, yCm: 0, larguraCm: 8.84, alturaCm: 8.94 };
  const registro1 = { xCm: 2.02, yCm: 3.9, larguraCm: 12.44, alturaCm: 7.54 };

  it("centraliza a foto da capa na área G10:K22", () => {
    expect(calcularPosicao(capa, { largura: 6.8, altura: 6.5 })).toEqual({
      xCm: 1.02,
      yCm: 1.22,
    });
  });

  it("centraliza a foto do registro 1 na área C185:I199", () => {
    expect(calcularPosicao(registro1, { largura: 9.6, altura: 7.2 })).toEqual({
      xCm: 3.44,
      yCm: 4.07,
    });
  });

  it("mantém simetria: sobras iguais à esquerda e à direita", () => {
    const area = { xCm: 5, yCm: 10, larguraCm: 12.44, alturaCm: 7.54 };
    const foto = { largura: 9.6, altura: 7.2 };
    const { xCm, yCm } = calcularPosicao(area, foto);

    expect(xCm - area.xCm).toBeCloseTo(area.xCm + area.larguraCm - (xCm + foto.largura), 6);
    expect(yCm - area.yCm).toBeCloseTo(area.yCm + area.alturaCm - (yCm + foto.altura), 6);
  });
});

describe("cmParaPixels", () => {
  it("converte uma polegada em 300 px a 300 dpi", () => {
    expect(cmParaPixels(2.54)).toBe(300);
  });

  it("usa 300 dpi por padrão e aceita outra resolução", () => {
    expect(cmParaPixels(1)).toBe(118);
    expect(cmParaPixels(2.54, 150)).toBe(150);
  });
});

describe("tamanhoEmPixels", () => {
  it("gera o canvas da capa em 803 × 768 px (6,8 × 6,5 cm a 300 dpi)", () => {
    expect(tamanhoEmPixels({ largura: 6.8, altura: 6.5 })).toEqual({ largura: 803, altura: 768 });
  });

  it("gera o canvas dos registros em 1134 × 850 px (9,6 × 7,2 cm a 300 dpi)", () => {
    expect(tamanhoEmPixels({ largura: 9.6, altura: 7.2 })).toEqual({ largura: 1134, altura: 850 });
  });
});

describe("escalaContida", () => {
  it("limita pelo eixo mais restritivo, mantendo a proporção", () => {
    expect(escalaContida(1600, 1200, 803, 768)).toBeCloseTo(0.501875, 6);
    expect(escalaContida(1200, 1600, 1134, 850)).toBeCloseTo(0.53125, 6);
  });

  it("amplia imagens menores para alcançar a resolução final (300 dpi)", () => {
    expect(escalaContida(100, 50, 803, 768)).toBeCloseTo(8.03, 6);
  });
});

describe("letraParaIndice", () => {
  it("converte letras de coluna para índice 0-based", () => {
    expect(letraParaIndice("A")).toBe(0);
    expect(letraParaIndice("G")).toBe(6);
    expect(letraParaIndice("I")).toBe(8);
    expect(letraParaIndice("K")).toBe(10);
    expect(letraParaIndice("AA")).toBe(26);
  });

  it("aceita minúsculas e espaços", () => {
    expect(letraParaIndice(" c ")).toBe(2);
  });

  it("recusa texto que não é letra de coluna", () => {
    expect(() => letraParaIndice("1")).toThrow();
    expect(() => letraParaIndice("")).toThrow();
  });
});

describe("AREAS_FOTO", () => {
  it("tem as 8 posições da seção 5 do SPEC, na ordem capa + registros", () => {
    expect(AREAS_FOTO).toHaveLength(8);
    expect(AREAS_FOTO.map((area) => area.posicao)).toEqual([
      "Capa",
      "Registro 1",
      "Registro 2",
      "Registro 3",
      "Registro 4",
      "Registro 5",
      "Registro 6",
      "Registro 7",
    ]);
  });

  it("usa as células e medidas confirmadas", () => {
    const capa = AREAS_FOTO[0];

    expect(capa).toMatchObject({
      colunaInicio: "G",
      linhaInicio: 10,
      colunaFim: "K",
      linhaFim: 22,
      larguraCm: 8.84,
      alturaCm: 8.94,
    });

    const registro3 = AREAS_FOTO[3];

    expect(registro3).toMatchObject({
      colunaInicio: "C",
      linhaInicio: 221,
      colunaFim: "I",
      linhaFim: 235,
      larguraCm: 12.44,
      alturaCm: 7.49,
    });
  });

  it("mantém 12,44 × 7,54 cm nos registros fora o registro 3", () => {
    for (const indice of [1, 2, 4, 5, 6, 7]) {
      expect(AREAS_FOTO[indice].larguraCm).toBe(12.44);
      expect(AREAS_FOTO[indice].alturaCm).toBe(7.54);
    }
  });
});

describe("calcularAncora", () => {
  /** Grade padrão do Excel com Calibri 11: coluna 64 px, linha 20 px. */
  const gradePadrao = () => ({
    colunas: Array(12).fill(64),
    linhas: Array(24).fill(20),
  });

  it("ancora a capa em G12: o offset vertical de 1,22 cm passa de uma linha", () => {
    expect(calcularAncora(AREAS_FOTO[0], { largura: 6.8, altura: 6.5 }, gradePadrao())).toEqual({
      coluna: 6,
      linha: 11, // G10 + 2 linhas de 20 px
      deslocamentoXEmu: 367200, // (8,84 - 6,8) / 2 cm
      deslocamentoYEmu: 58200, // (8,94 - 6,5) / 2 cm - 40 px
      larguraPx: 257,
      alturaPx: 246,
    });
  });

  it("ancora o registro 1 em C185 com o deslocamento centralizado em EMU", () => {
    expect(calcularAncora(AREAS_FOTO[1], { largura: 9.6, altura: 7.2 }, gradePadrao())).toEqual({
      coluna: 2,
      linha: 184,
      deslocamentoXEmu: 511200, // (12,44 - 9,6) / 2 cm
      deslocamentoYEmu: 61200, // (7,54 - 7,2) / 2 cm
      larguraPx: 363,
      alturaPx: 272,
    });
  });

  it("usa a altura real de 7,49 cm no registro 3", () => {
    expect(
      calcularAncora(AREAS_FOTO[3], { largura: 9.6, altura: 7.2 }, gradePadrao())
    ).toMatchObject({
      coluna: 2,
      linha: 220,
      deslocamentoYEmu: 52200, // (7,49 - 7,2) / 2 cm
    });
  });

  it("nunca deixa o deslocamento maior que a célula da âncora", () => {
    const grade = gradePadrao();
    const ancora = calcularAncora(AREAS_FOTO[0], { largura: 6.8, altura: 6.5 }, grade);
    const colunaRelativa = ancora.coluna - letraParaIndice(AREAS_FOTO[0].colunaInicio);
    const linhaRelativa = ancora.linha - (AREAS_FOTO[0].linhaInicio - 1);

    expect(ancora.deslocamentoXEmu).toBeLessThan(grade.colunas[colunaRelativa] * EMU_POR_PX);
    expect(ancora.deslocamentoYEmu).toBeLessThan(grade.linhas[linhaRelativa] * EMU_POR_PX);
  });

  it("percorre mais de uma coluna quando a sobra é maior que a coluna", () => {
    const area = { colunaInicio: "C", linhaInicio: 5, larguraCm: 3, alturaCm: 2 };
    const grade = { colunas: Array(6).fill(20), linhas: Array(6).fill(20) };
    const ancora = calcularAncora(area, { largura: 1, altura: 1 }, grade);

    expect(ancora.coluna).toBe(3);
    expect(ancora.linha).toBe(4);
    expect(ancora.deslocamentoXEmu).toBe(Math.round((PX_POR_CM - 20) * EMU_POR_PX));
    // A sobra vertical é (2 - 1) / 2 = 0,5 cm, menor que uma linha de 20 px.
    expect(ancora.deslocamentoYEmu).toBe(180000);
  });

  it("preenche exatamente a área com a foto e as sobras simétricas", () => {
    const area = AREAS_FOTO[1];
    const foto = { largura: 9.6, altura: 7.2 };
    const grade = {
      colunas: Array(7).fill(64),
      linhas: Array(15).fill(20),
    };
    const ancora = calcularAncora(area, foto, grade);

    // Posição do canto superior esquerdo a partir do início da área, em px.
    const colunaRelativa = ancora.coluna - letraParaIndice(area.colunaInicio);
    const linhaRelativa = ancora.linha - (area.linhaInicio - 1);
    const esquerdaPx =
      colunaRelativa * 64 + ancora.deslocamentoXEmu / EMU_POR_PX;
    const acimaPx =
      linhaRelativa * 20 + ancora.deslocamentoYEmu / EMU_POR_PX;

    const direitaPx = area.larguraCm * PX_POR_CM - esquerdaPx - foto.largura * PX_POR_CM;
    const abaixoPx = area.alturaCm * PX_POR_CM - acimaPx - foto.altura * PX_POR_CM;

    expect(esquerdaPx).toBeCloseTo(direitaPx, 4);
    expect(acimaPx).toBeCloseTo(abaixoPx, 4);
    expect(ancora.larguraPx / PX_POR_CM).toBeCloseTo(foto.largura, 2);
    expect(ancora.alturaPx / PX_POR_CM).toBeCloseTo(foto.altura, 2);
  });
});

describe("larguraColunaEmPixels", () => {
  it("converte a largura de coluna padrão (8,43) em 64 px", () => {
    expect(larguraColunaEmPixels(8.43)).toBe(64);
  });

  it("converte larguras maiores mantendo a proporção", () => {
    expect(larguraColunaEmPixels(14.29)).toBe(105);
  });
});

describe("alturaLinhaEmPixels", () => {
  it("converte a altura padrão (15 pt) em 20 px", () => {
    expect(alturaLinhaEmPixels(15)).toBe(20);
  });

  it("converte 30 pt em 40 px", () => {
    expect(alturaLinhaEmPixels(30)).toBe(40);
  });
});

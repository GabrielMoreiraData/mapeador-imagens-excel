import { describe, expect, it } from "vitest";

import { ajustarSemCorte, calcularPosicao, validarFotos } from "../src/layout.js";

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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A geometria da rotação vive dentro da IIFE de index.html (a página roda em
// file:// e não importa módulos). O bloco entre os marcadores é avaliado aqui
// para testar exatamente o código de produção usado pelo botão de girar (A3).
const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const BLOCO = HTML.match(
  /\/\* ROTACAO_INICIO \*\/([\s\S]*?)\/\* ROTACAO_FIM \*\//
);

if (!BLOCO) {
  throw new Error("Bloco ROTACAO_INICIO/FIM não encontrado em index.html.");
}

const {
  ROTACAO_PASSO,
  normalizarRotacao,
  proximaRotacao,
  rotacaoTrocada,
  areaDeDesenho,
  registrarCliquePendente,
  retirarCliquePendente,
} = new Function(
  `${BLOCO[1]}
  return {
    ROTACAO_PASSO,
    normalizarRotacao,
    proximaRotacao,
    rotacaoTrocada,
    areaDeDesenho,
    registrarCliquePendente,
    retirarCliquePendente,
  };`
)();

describe("ciclo de rotação (A3)", () => {
  it("gira 90° no sentido horário a cada clique", () => {
    expect(ROTACAO_PASSO).toBe(90);
    expect(proximaRotacao(0)).toBe(90);
    expect(proximaRotacao(90)).toBe(180);
    expect(proximaRotacao(180)).toBe(270);
    expect(proximaRotacao(270)).toBe(0);
  });

  it("volta ao ângulo inicial depois de quatro cliques", () => {
    let rotacao = 0;

    for (let passo = 0; passo < 4; passo += 1) {
      rotacao = proximaRotacao(rotacao);
    }

    expect(rotacao).toBe(0);
  });

  it("normaliza ângulos fora da faixa 0–270", () => {
    expect(normalizarRotacao(360)).toBe(0);
    expect(normalizarRotacao(450)).toBe(90);
    expect(normalizarRotacao(-90)).toBe(270);
    expect(normalizarRotacao(-360)).toBe(0);
    expect(proximaRotacao(450)).toBe(180);
    expect(proximaRotacao(-90)).toBe(0);
  });

  it("trata valores vazios ou inválidos como 0°", () => {
    expect(normalizarRotacao(null)).toBe(0);
    expect(normalizarRotacao(undefined)).toBe(0);
    expect(normalizarRotacao("abc")).toBe(0);
    expect(proximaRotacao(null)).toBe(90);
  });
});

describe("geometria da rotação (A3)", () => {
  it("troca largura e altura apenas em 90° e 270°", () => {
    expect(rotacaoTrocada(0)).toBe(false);
    expect(rotacaoTrocada(90)).toBe(true);
    expect(rotacaoTrocada(180)).toBe(false);
    expect(rotacaoTrocada(270)).toBe(true);
    expect(rotacaoTrocada(360)).toBe(false);
    expect(rotacaoTrocada(-90)).toBe(true);
  });

  it("mantém o canvas final e cobre a área inteira em todos os ângulos", () => {
    const largura = 1469;
    const altura = 890;

    expect(areaDeDesenho(largura, altura, 0)).toEqual({ largura, altura });
    expect(areaDeDesenho(largura, altura, 90)).toEqual({
      largura: altura,
      altura: largura,
    });
    expect(areaDeDesenho(largura, altura, 180)).toEqual({ largura, altura });
    expect(areaDeDesenho(largura, altura, 270)).toEqual({
      largura: altura,
      altura: largura,
    });
  });
});

describe("fila de cliques rápidos (A3)", () => {
  it("conta um passo para cada clique recebido durante o processamento", () => {
    const fila = new Map();
    const foto = { nome: "capa.jpg" };

    expect(registrarCliquePendente(fila, foto)).toBe(1);
    expect(registrarCliquePendente(fila, foto)).toBe(2);
    expect(registrarCliquePendente(fila, foto)).toBe(3);
    expect(fila.get(foto)).toBe(3);
  });

  it("aplica 270° em três cliques rápidos, sem perder nenhum", () => {
    const fila = new Map();
    const foto = { nome: "capa.jpg" };

    // 1º clique dispara o processamento imediato; os outros dois aguardam.
    let rotacao = proximaRotacao(0);
    let giros = 1;

    registrarCliquePendente(fila, foto);
    registrarCliquePendente(fila, foto);

    while (retirarCliquePendente(fila, foto)) {
      rotacao = proximaRotacao(rotacao);
      giros += 1;
    }

    expect(giros).toBe(3);
    expect(rotacao).toBe(270);
    expect(fila.has(foto)).toBe(false);
  });

  it("não perde cliques excedentes e isola fotos diferentes", () => {
    const fila = new Map();
    const capa = { nome: "capa.jpg" };
    const registro = { nome: "registro-1.jpg" };

    for (let clique = 0; clique < 5; clique += 1) {
      registrarCliquePendente(fila, capa);
    }
    registrarCliquePendente(fila, registro);

    let girosCapa = 0;
    while (retirarCliquePendente(fila, capa)) {
      girosCapa += 1;
    }

    expect(girosCapa).toBe(5);
    expect(fila.get(capa)).toBeUndefined();
    expect(fila.get(registro)).toBe(1);
    expect(retirarCliquePendente(fila, registro)).toBe(true);
    expect(retirarCliquePendente(fila, registro)).toBe(false);
    expect(retirarCliquePendente(fila, registro)).toBe(false);
  });
});

describe("botão de girar na miniatura (A3)", () => {
  const trechoCriarVaga = HTML.slice(
    HTML.indexOf("function criarVaga"),
    HTML.indexOf("function renderizarFotos")
  );

  it("fica à esquerda do botão ← e usa o mesmo componente de controle", () => {
    const posicaoGirar = trechoCriarVaga.indexOf('"girar"');
    const posicaoEsquerda = trechoCriarVaga.indexOf('"esquerda"');

    expect(posicaoGirar).toBeGreaterThan(-1);
    expect(posicaoEsquerda).toBeGreaterThan(-1);
    expect(posicaoGirar).toBeLessThan(posicaoEsquerda);
    expect(trechoCriarVaga).toContain("criarControle(");
    expect(trechoCriarVaga).toContain('"⟳"');
  });

  it("expõe o rótulo acessível com a posição da foto", () => {
    expect(trechoCriarVaga).toContain("`Girar foto de ${POSICOES[indice]}`");
  });
});

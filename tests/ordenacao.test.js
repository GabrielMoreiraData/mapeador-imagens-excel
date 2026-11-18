import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// As funções de ordenação vivem dentro da IIFE de index.html (a página roda
// em file:// e não importa módulos). O bloco entre os marcadores é avaliado
// aqui para testar exatamente o código de produção usado pelas setas (RF06).
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const bloco = html.match(
  /\/\* ORDENACAO_INICIO \*\/([\s\S]*?)\/\* ORDENACAO_FIM \*\//
);

if (!bloco) {
  throw new Error("Bloco ORDENACAO_INICIO/FIM não encontrado em index.html.");
}

const { trocarFotos, removerFotoNaLista } = new Function(
  `${bloco[1]}\nreturn { trocarFotos, removerFotoNaLista };`
)();

const criarFotos = () =>
  Array.from({ length: 8 }, (_, indice) => ({
    nome: indice === 0 ? "capa.jpg" : `registro-${indice}.jpg`,
  }));

const nomes = (lista) => lista.map((foto) => foto.nome);

describe("ordenação das fotos (RF06)", () => {
  it("troca a foto com a vizinha seguinte", () => {
    const fotos = criarFotos();
    const resultado = trocarFotos(fotos, 2, 3);

    expect(nomes(resultado).slice(2, 4)).toEqual([
      "registro-3.jpg",
      "registro-2.jpg",
    ]);
    expect(nomes(resultado)).toHaveLength(8);
  });

  it("troca um registro com a capa", () => {
    const fotos = criarFotos();
    const resultado = trocarFotos(fotos, 1, 0);

    expect(nomes(resultado).slice(0, 2)).toEqual([
      "registro-1.jpg",
      "capa.jpg",
    ]);
  });

  it("não altera o array original ao trocar", () => {
    const fotos = criarFotos();
    const antes = nomes(fotos);

    trocarFotos(fotos, 0, 1);

    expect(nomes(fotos)).toEqual(antes);
  });

  it("devolve uma cópia quando a origem e o destino são iguais", () => {
    const fotos = criarFotos();
    const resultado = trocarFotos(fotos, 3, 3);

    expect(resultado).not.toBe(fotos);
    expect(nomes(resultado)).toEqual(nomes(fotos));
  });

  it("ignora índices fora da lista e devolve uma cópia intacta", () => {
    const fotos = criarFotos();

    for (const [origem, destino] of [
      [-1, 0],
      [0, -1],
      [8, 0],
      [0, 8],
    ]) {
      const resultado = trocarFotos(fotos, origem, destino);
      expect(resultado).not.toBe(fotos);
      expect(nomes(resultado)).toEqual(nomes(fotos));
    }
  });

  it("remove a capa e compacta a ordem", () => {
    const fotos = criarFotos();
    const resultado = removerFotoNaLista(fotos, 0);

    expect(nomes(resultado)).toHaveLength(7);
    expect(resultado[0].nome).toBe("registro-1.jpg");
    expect(resultado[6].nome).toBe("registro-7.jpg");
  });

  it("remove uma foto do meio e mantém a ordem das demais", () => {
    const fotos = criarFotos();
    const resultado = removerFotoNaLista(fotos, 4);

    expect(nomes(resultado)).toEqual([
      "capa.jpg",
      "registro-1.jpg",
      "registro-2.jpg",
      "registro-3.jpg",
      "registro-5.jpg",
      "registro-6.jpg",
      "registro-7.jpg",
    ]);
  });

  it("remove a última foto sem deixar buraco", () => {
    const fotos = criarFotos();
    const resultado = removerFotoNaLista(fotos, 7);

    expect(nomes(resultado)).toHaveLength(7);
    expect(resultado[6].nome).toBe("registro-6.jpg");
  });

  it("ignora índice inválido ao remover e devolve uma cópia intacta", () => {
    const fotos = criarFotos();

    for (const indice of [-1, 8, 99]) {
      const resultado = removerFotoNaLista(fotos, indice);
      expect(resultado).not.toBe(fotos);
      expect(nomes(resultado)).toEqual(nomes(fotos));
    }
  });

  it("mantém a contagem correta depois de trocar e remover", () => {
    let fotos = criarFotos();
    fotos = trocarFotos(fotos, 1, 0); // Registro 1 vira capa.
    fotos = removerFotoNaLista(fotos, 2); // Remove o antigo Registro 2.
    fotos = trocarFotos(fotos, 0, 1); // Capa volta para a segunda posição.

    expect(nomes(fotos)).toEqual([
      "capa.jpg",
      "registro-1.jpg",
      "registro-3.jpg",
      "registro-4.jpg",
      "registro-5.jpg",
      "registro-6.jpg",
      "registro-7.jpg",
    ]);
  });
});

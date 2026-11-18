import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// A validação/normalização do nome vive dentro da IIFE de index.html (a página
// roda em file://). O bloco é extraído e avaliado aqui para testar exatamente
// o código de produção usado pelo campo "Nome do arquivo" (Fase A2).
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const HTML = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const BLOCO = HTML.match(
  /\/\* NOME_ARQUIVO_INICIO \*\/([\s\S]*?)\/\* NOME_ARQUIVO_FIM \*\//
);

if (!BLOCO) {
  throw new Error("Bloco NOME_ARQUIVO_INICIO/FIM não encontrado em index.html.");
}

const {
  nomeBaseDoModelo,
  nomeBaseDigitado,
  nomeBaseResolvido,
  validarNomeArquivo,
  nomeArquivoResolvido,
} = new Function(
  `${BLOCO[1]}
  return {
    nomeBaseDoModelo,
    nomeBaseDigitado,
    nomeBaseResolvido,
    validarNomeArquivo,
    nomeArquivoResolvido,
  };`
)();

const PROIBIDOS = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
const RESERVADOS = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, indice) => `COM${indice + 1}`),
  ...Array.from({ length: 9 }, (_, indice) => `LPT${indice + 1}`),
];

describe("nome base do modelo (A2)", () => {
  it("remove a extensão .xlsx sem diferenciar maiúsculas", () => {
    expect(nomeBaseDoModelo("ori - Copia.xlsx")).toBe("ori - Copia");
    expect(nomeBaseDoModelo("  MODELO.XLSX  ")).toBe("MODELO");
  });

  it("mantém nomes sem extensão e usa o padrão quando vazio", () => {
    expect(nomeBaseDoModelo("modelo")).toBe("modelo");
    expect(nomeBaseDoModelo("")).toBe("relatorio-ensaio");
    expect(nomeBaseDoModelo(null)).toBe("relatorio-ensaio");
    expect(nomeBaseDoModelo(undefined)).toBe("relatorio-ensaio");
  });
});

describe("resolução do nome do arquivo (A2)", () => {
  it("usa o nome do modelo quando o campo está vazio", () => {
    expect(nomeArquivoResolvido("", "ori - Copia.xlsx")).toBe("ori - Copia.xlsx");
    expect(nomeArquivoResolvido("", "modelo.xlsx")).toBe("modelo.xlsx");
    expect(nomeArquivoResolvido("", "")).toBe("relatorio-ensaio.xlsx");
  });

  it("acrescenta um único .xlsx ao nome digitado", () => {
    expect(nomeArquivoResolvido("ensaio", "modelo.xlsx")).toBe("ensaio.xlsx");
    expect(nomeArquivoResolvido("ensaio.xlsx", "modelo.xlsx")).toBe("ensaio.xlsx");
    expect(nomeArquivoResolvido("ensaio.XLSX", "modelo.xlsx")).toBe("ensaio.xlsx");
  });

  it("dá prioridade ao nome digitado sobre o nome do modelo", () => {
    expect(nomeArquivoResolvido("personalizado", "ori - Copia.xlsx")).toBe(
      "personalizado.xlsx"
    );
  });
});

describe("validação do nome do arquivo (A2)", () => {
  it("aceita nomes comuns e o campo vazio com fallback", () => {
    expect(validarNomeArquivo("relatorio", "modelo.xlsx")).toEqual({
      ok: true,
      base: "relatorio",
    });
    expect(validarNomeArquivo("ensaio final.xlsx", "modelo.xlsx")).toEqual({
      ok: true,
      base: "ensaio final",
    });
    expect(validarNomeArquivo("", "ori - Copia.xlsx")).toEqual({
      ok: true,
      base: "ori - Copia",
    });
  });

  it("valida também o nome do modelo usado como fallback", () => {
    expect(validarNomeArquivo("", "CON.xlsx")).toEqual({
      ok: false,
      erro: "Nome reservado do sistema.",
    });
  });

  it.each(PROIBIDOS)("recusa o caractere proibido %j", (caractere) => {
    const resultado = validarNomeArquivo(`foto${caractere}ensaio`, "modelo.xlsx");

    expect(resultado.ok).toBe(false);
    expect(resultado.erro).toContain("não pode conter");
  });

  it.each(["\u0000", "\u0001", "\u001F", "\t", "\n"])(
    "recusa caractere de controle %j",
    (caractere) => {
      const resultado = validarNomeArquivo(`foto${caractere}ensaio`, "modelo.xlsx");

      expect(resultado.ok).toBe(false);
      expect(resultado.erro).toBe("O nome não pode conter caracteres de controle.");
    }
  );

  it.each(RESERVADOS)("recusa o nome reservado %s", (reservado) => {
    expect(validarNomeArquivo(reservado, "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
    expect(validarNomeArquivo(reservado.toLowerCase(), "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
  });

  it("recusa reservados mesmo com extensão digitada", () => {
    expect(validarNomeArquivo("CON.xlsx", "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
    expect(validarNomeArquivo("lpt9.txt", "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
    expect(validarNomeArquivo("con.foo.bar", "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
    expect(validarNomeArquivo("CON .txt", "modelo.xlsx").erro).toBe(
      "Nome reservado do sistema."
    );
  });

  it("aceita nomes parecidos com reservados", () => {
    expect(validarNomeArquivo("CONTRATO", "modelo.xlsx").ok).toBe(true);
    expect(validarNomeArquivo("COM10", "modelo.xlsx").ok).toBe(true);
    expect(validarNomeArquivo("LPT0", "modelo.xlsx").ok).toBe(true);
  });

  it.each(["abc.", "abc ", "abc .xlsx", "abc..xlsx"])(
    "recusa nome terminado em ponto ou espaço: %j",
    (nome) => {
      const resultado = validarNomeArquivo(nome, "modelo.xlsx");

      expect(resultado.ok).toBe(false);
      expect(resultado.erro).toBe("O nome não pode terminar com ponto ou espaço.");
    }
  );

  it("recusa mais de 120 caracteres e aceita exatamente 120", () => {
    const limite = "a".repeat(120);

    expect(validarNomeArquivo(limite, "modelo.xlsx").ok).toBe(true);
    expect(validarNomeArquivo(`${limite}.xlsx`, "modelo.xlsx").ok).toBe(true);
    expect(validarNomeArquivo(`${limite}b`, "modelo.xlsx")).toEqual({
      ok: false,
      erro: "Máximo de 120 caracteres.",
    });
  });

  it("recusa campo que contém apenas a extensão", () => {
    expect(validarNomeArquivo(".xlsx", "modelo.xlsx")).toEqual({
      ok: false,
      erro: "Informe um nome para o arquivo.",
    });
  });

  it("não normaliza o texto digitado: devolve a base apenas para uso", () => {
    expect(nomeBaseDigitado("ensaio.xlsx")).toBe("ensaio");
    expect(nomeBaseResolvido("ensaio.xlsx", "modelo.xlsx")).toBe("ensaio");
    expect(nomeBaseResolvido("", "modelo.xlsx")).toBe("modelo");
  });
});

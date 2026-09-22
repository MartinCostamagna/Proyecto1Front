import { describe, it, expect } from "vitest";
import {
  normalizarParteDenominacion,
  generarDenominacionProducto,
} from "./producto.util";

describe("normalizarParteDenominacion", () => {
  it("devuelve texto vacío para null y undefined", () => {
    expect(normalizarParteDenominacion(null)).toBe("");
    expect(normalizarParteDenominacion(undefined)).toBe("");
  });

  it("devuelve texto vacío para cadena vacía o solo espacios", () => {
    expect(normalizarParteDenominacion("")).toBe("");
    expect(normalizarParteDenominacion("   ")).toBe("");
  });

  it("omite placeholders SIN MARCA / SIN LINEA / SIN PRESENTACION en cualquier combinación de mayúsculas", () => {
    expect(normalizarParteDenominacion("SIN MARCA")).toBe("");
    expect(normalizarParteDenominacion("sin linea")).toBe("");
    expect(normalizarParteDenominacion("Sin Presentacion")).toBe("");
    expect(normalizarParteDenominacion("  SIN MARCA  ")).toBe("");
  });

  it("recorta y pasa a minúsculas una parte válida", () => {
    expect(normalizarParteDenominacion("  COCA-COLA  ")).toBe("coca-cola");
  });
});

describe("generarDenominacionProducto", () => {
  it("concatena las tres partes con un solo espacio y en minúsculas", () => {
    expect(
      generarDenominacionProducto("COCA", "GASEOSAS", "1.5L")
    ).toBe("coca gaseosas 1.5l");
  });

  it("omite la presentación cuando es nula", () => {
    expect(generarDenominacionProducto("COCA", "GASEOSAS", null)).toBe(
      "coca gaseosas"
    );
  });

  it("omite las partes con placeholder SIN...", () => {
    expect(
      generarDenominacionProducto("SIN MARCA", "SIN LINEA", "SIN PRESENTACION")
    ).toBe("");
  });

  it("no deja espacios dobles cuando una parte intermedia queda vacía", () => {
    expect(generarDenominacionProducto("COCA", null, "1.5L")).toBe("coca 1.5l");
  });

  it("devuelve cadena vacía cuando todas las partes quedan vacías", () => {
    expect(generarDenominacionProducto()).toBe("");
    expect(generarDenominacionProducto("   ", null, undefined)).toBe("");
  });
});
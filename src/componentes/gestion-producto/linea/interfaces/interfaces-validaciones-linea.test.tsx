import { describe, it, expect } from "vitest";
import { schema, transformData } from "./interfaces-validaciones-linea";

describe("schema de línea (validaciones yup)", () => {
  it("valida una línea con superlínea, sin stock crítico", async () => {
    const value = await schema(false).validate({
      denominacion: "aceites",
      superlineaId: 1,
      utilizaStockMinimo: false,
    });
    expect(value).toMatchObject({
      denominacion: "aceites",
      superlineaId: 1,
    });
  });

  it("rechaza denominación obligatoria", async () => {
    await expect(
      schema(false).validate({ denominacion: "", superlineaId: 1 })
    ).rejects.toThrow("La denominación es obligatoria.");
  });

  it("rechaza superlínea obligatoria (undefined)", async () => {
    await expect(
      schema(false).validate({ denominacion: "aceites" })
    ).rejects.toThrow("La superlínea es obligatoria.");
  });

  it("rechaza superlínea obligatoria (cero)", async () => {
    await expect(
      schema(false).validate({ denominacion: "aceites", superlineaId: 0 })
    ).rejects.toThrow("La superlínea es obligatoria.");
  });

  it("rechaza superlínea que no es número entero", async () => {
    await expect(
      schema(false).validate({ denominacion: "aceites", superlineaId: 1.5 })
    ).rejects.toThrow("La superlínea debe ser un número entero.");
  });

  it("rechaza superlínea que no es número", async () => {
    await expect(
      schema(false).validate({ denominacion: "aceites", superlineaId: "abc" })
    ).rejects.toThrow("La superlínea debe ser un número.");
  });

  it("rechaza caracteres no permitidos en la denominación", async () => {
    await expect(
      schema(false).validate({ denominacion: "aceites@!", superlineaId: 1 })
    ).rejects.toThrow("Solo se permiten letras, números y espacios.");
  });

  it("exige stock mínimo cuando utilizaStockMinimo es true", async () => {
    await expect(
      schema(true).validate({
        denominacion: "aceites",
        superlineaId: 1,
        utilizaStockMinimo: true,
      })
    ).rejects.toThrow("El Stock minimo es obligatorio.");
  });

  it("exige stock mínimo mayor a 0 cuando está activo", async () => {
    await expect(
      schema(true).validate({
        denominacion: "aceites",
        superlineaId: 1,
        utilizaStockMinimo: true,
        stockMinimo: 0,
      })
    ).rejects.toThrow("El stock minimo debe ser mayor a 0.");
  });

  it("acepta stock mínimo opcional cuando está desactivado", async () => {
    await expect(
      schema(false).validate({
        denominacion: "aceites",
        superlineaId: 1,
        utilizaStockMinimo: false,
      })
    ).resolves.toBeTruthy();
  });
});

describe("transformData", () => {
  it("mapea una línea a valores de formulario", () => {
    const values = transformData({
      id: 1,
      denominacion: "aceites",
      superlineaId: 2,
      observacion: "uso doméstico",
      stockMinimo: 5,
      utilizaStockMinimo: true,
      sistema: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioCreatedId: 1,
      sublineas: [],
    });

    expect(values).toEqual({
      denominacion: "aceites",
      superlineaId: 2,
      observacion: "uso doméstico",
      stockMinimo: 5,
      utilizaStockMinimo: true,
    });
  });

  it("traduce observación y stock nulos", () => {
    const values = transformData({
      id: 2,
      denominacion: "harinas",
      superlineaId: 1,
      observacion: null,
      stockMinimo: null,
      utilizaStockMinimo: null,
      sistema: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioCreatedId: 1,
      sublineas: [],
    });

    expect(values.observacion).toBeNull();
    expect(values.stockMinimo).toBe(0);
    expect(values.utilizaStockMinimo).toBe(false);
  });
});
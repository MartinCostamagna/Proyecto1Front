import { describe, it, expect } from "vitest";
import { schema } from "./interfaces-validaciones-superlinea";

describe("schema de superlínea (validaciones yup)", () => {
  it("valida una denominación válida", async () => {
    await expect(
      schema.validate({ denominacion: "Alimentos" })
    ).resolves.toMatchObject({ denominacion: "alimentos" });
  });

  it("rechaza denominación obligatoria", async () => {
    await expect(schema.validate({ denominacion: "" })).rejects.toThrow(
      "La denominación es obligatoria."
    );
  });

  it("normaliza a minúsculas y recorta la denominación", async () => {
    const value = await schema.validate({ denominacion: "  LIMPIEZA  " });
    expect(value.denominacion).toBe("limpieza");
  });

  it("rechaza caracteres no permitidos", async () => {
    await expect(schema.validate({ denominacion: "limpieza@#" })).rejects.toThrow(
      "Solo se permiten letras, números y espacios."
    );
  });

  it("rechaza denominaciones de más de 255 caracteres", async () => {
    await expect(
      schema.validate({ denominacion: "a".repeat(256) })
    ).rejects.toThrow("Máximo 255 caracteres.");
  });

  it("acepta observación nula u opcional", async () => {
    await expect(
      schema.validate({ denominacion: "higiene", observacion: null })
    ).resolves.toMatchObject({ observacion: null });
  });
});
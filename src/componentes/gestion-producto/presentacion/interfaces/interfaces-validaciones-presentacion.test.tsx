import { describe, it, expect } from "vitest";
import { schema, transformData } from "./interfaces-validaciones-presentacion";

describe("schema de presentación (validaciones yup)", () => {
  it("valida una denominación válida", async () => {
    await expect(
      schema.validate({ denominacion: "pack x6 de 500ml" })
    ).resolves.toMatchObject({ denominacion: "pack x6 de 500ml" });
  });

  it("rechaza denominación obligatoria", async () => {
    await expect(schema.validate({ denominacion: "" })).rejects.toThrow(
      "La denominación es obligatoria."
    );
  });

  it("normaliza a minúsculas y recorta la denominación", async () => {
    const value = await schema.validate({ denominacion: "  PACK X6  " });
    expect(value.denominacion).toBe("pack x6");
  });

  it("rechaza caracteres no permitidos", async () => {
    await expect(schema.validate({ denominacion: "pack@#!" })).rejects.toThrow(
      "Solo se permiten letras, números y espacios."
    );
  });

  it("rechaza denominaciones de más de 255 caracteres", async () => {
    await expect(
      schema.validate({ denominacion: "a".repeat(256) })
    ).rejects.toThrow("no puede superar los 255 caracteres.");
  });

  it("acepta observación nula u opcional", async () => {
    await expect(
      schema.validate({ denominacion: "pack", observacion: null })
    ).resolves.toMatchObject({ observacion: null });
  });
});

describe("transformData", () => {
  it("mapea una presentación a valores de formulario", () => {
    const values = transformData({
      id: 1,
      denominacion: "pack x6",
      observacion: "pack de latas",
      sistema: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioCreatedId: 1,
      usuarioUpdatedId: 1,
      usuarioDeletedId: null,
    });

    expect(values).toEqual({
      denominacion: "pack x6",
      observacion: "pack de latas",
    });
  });

  it("traduce observación nula a null", () => {
    const values = transformData({
      id: 2,
      denominacion: "1l",
      observacion: null,
      sistema: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioCreatedId: 1,
      usuarioUpdatedId: 1,
      usuarioDeletedId: null,
    });

    expect(values.observacion).toBeNull();
  });
});
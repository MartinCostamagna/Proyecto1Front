import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePresentacionForm } from "./use-presentacion-form";
import PresentacionService from "../services/presentacion-service";
import { parseApiError } from "../../../../utils/errores";
import { getUsuarioId } from "../../../../utils/auth";

vi.mock("../services/presentacion-service", () => ({
  default: {
    nuevo: vi.fn(),
    actualizar: vi.fn(),
  },
}));

vi.mock("../../../../utils/errores", () => ({
  parseApiError: vi.fn(),
}));

vi.mock("../../../../utils/auth", () => ({
  getUsuarioId: vi.fn(),
}));

const mockedService = vi.mocked(PresentacionService);
const mockedParse = vi.mocked(parseApiError);
const mockedGetUsuarioId = vi.mocked(getUsuarioId);

describe("usePresentacionForm", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUsuarioId.mockReturnValue(7);
  });

  it("crea una presentación con usuarioCreatedId y notifica éxito", async () => {
    mockedService.nuevo.mockResolvedValue({ mensaje: "creada" } as any);
    const { result } = renderHook(() =>
      usePresentacionForm(undefined, onClose, onSuccess)
    );

    await act(async () => {
      await result.current.onSubmit({
        denominacion: "pack x6",
        observacion: null,
      });
    });

    expect(mockedService.nuevo).toHaveBeenCalledWith({
      denominacion: "pack x6",
      observacion: null,
      usuarioCreatedId: 7,
    });
    expect(onClose).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith("creada");
  });

  it("actualiza una presentación existente con usuarioUpdatedId", async () => {
    mockedService.actualizar.mockResolvedValue({ mensaje: "editada" } as any);
    const { result } = renderHook(() =>
      usePresentacionForm(
        {
          id: 3,
          denominacion: "pack x6",
          observacion: "latas",
          sistema: 0,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usuarioCreatedId: 1,
          usuarioUpdatedId: 1,
          usuarioDeletedId: null,
        },
        onClose,
        onSuccess
      )
    );

    await act(async () => {
      await result.current.onSubmit({
        denominacion: "pack x6",
        observacion: null,
      });
    });

    expect(mockedService.actualizar).toHaveBeenCalledWith(3, {
      denominacion: "pack x6",
      observacion: null,
      usuarioUpdatedId: 7,
    });
    expect(onClose).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith("editada");
  });

  it("expone el error del servidor en errors.root cuando falla", async () => {
    mockedService.nuevo.mockRejectedValue(new Error("boom"));
    mockedParse.mockReturnValue("Denominación ya en uso.");
    const { result } = renderHook(() =>
      usePresentacionForm(undefined, onClose, onSuccess)
    );

    await act(async () => {
      await result.current.onSubmit({ denominacion: "pack x6", observacion: null });
    });

    expect(parseApiError).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.errors.root?.message).toBe("Denominación ya en uso.");
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useHistorialPrecios, FILTROS_INICIALES } from "./use-historial-precios";
import HistorialPreciosService from "../services/historial-precios-service";
import { act, renderHook } from "@testing-library/react";

vi.mock("../services/historial-precios-service", () => ({
  default: {
    obtener: vi.fn(),
  },
}));

const REGISTRO = {
  id: 1,
  productoId: 12,
  productoDenominacion: "COCA COLA 500ML",
  productoLinea: "GASEOSAS",
  precioAnterior: 100,
  precioNuevo: 150,
  variacion: 50,
  variacionPorcentaje: 50,
  fecha: "2026-09-25T15:30:00.000Z",
  motivo: "Aumento",
  usuarioDenominacion: "Admin",
};

const mocked = vi.mocked(HistorialPreciosService);

describe("useHistorialPrecios (CR-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.obtener.mockResolvedValue({ data: [REGISTRO], total: 1 });
    localStorage.setItem("Token", "fake-token");
  });

  it("arranca sin datos y con la paginación por defecto", () => {
    const { result } = renderHook(() => useHistorialPrecios());

    expect(result.current.registros).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.skip).toBe(0);
    expect(result.current.take).toBe(10);
    expect(result.current.paginaActual).toBe(1);
    expect(result.current.filtros).toEqual(FILTROS_INICIALES);
  });

  describe("consulta", () => {
    it("carga los registros y el total", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        await result.current.buscar(0, 10);
      });

      await waitFor(() => expect(result.current.registros).toHaveLength(1));
      expect(result.current.total).toBe(1);
      expect(result.current.registros[0].productoDenominacion).toBe("COCA COLA 500ML");
    });

    it("manda la paginación al servicio", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        await result.current.buscar(40, 25);
      });

      expect(mocked.obtener).toHaveBeenCalledWith({ skip: 40, take: 25 });
    });

    it("solo manda los filtros con valor (no ensucia la query)", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        result.current.aplicarFiltros({ ...FILTROS_INICIALES, denominacion: "coca" });
      });
      await act(async () => {
        await result.current.buscar(0, 10);
      });

      expect(mocked.obtener).toHaveBeenCalledWith({ skip: 0, take: 10, denominacion: "coca" });
    });

    it("manda todos los filtros informados", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        result.current.aplicarFiltros({
          denominacion: "coca",
          motivo: "aumento",
          fechaDesde: "2026-09-01",
          fechaHasta: "2026-09-30",
        });
      });
      await act(async () => {
        await result.current.buscar(0, 10);
      });

      expect(mocked.obtener).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        denominacion: "coca",
        motivo: "aumento",
        fechaDesde: "2026-09-01",
        fechaHasta: "2026-09-30",
      });
    });

    it("hace trim a los filtros de texto", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        result.current.aplicarFiltros({ ...FILTROS_INICIALES, denominacion: "  coca  " });
      });
      await act(async () => {
        await result.current.buscar(0, 10);
      });

      expect(mocked.obtener).toHaveBeenCalledWith({ skip: 0, take: 10, denominacion: "coca" });
    });
  });

  describe("paginación", () => {
    it("aplicarFiltros vuelve a la primera página", async () => {
      const { result } = renderHook(() => useHistorialPrecios());

      act(() => {
        result.current.cambiarPagina(40, 10, 5);
      });
      expect(result.current.paginaActual).toBe(5);

      act(() => {
        result.current.aplicarFiltros({ ...FILTROS_INICIALES });
      });
      expect(result.current.paginaActual).toBe(1);
      expect(result.current.skip).toBe(0);
    });

    it("cambiarPagina actualiza skip, take y página actual", () => {
      const { result } = renderHook(() => useHistorialPrecios());

      act(() => {
        result.current.cambiarPagina(20, 25, 2);
      });

      expect(result.current.skip).toBe(20);
      expect(result.current.take).toBe(25);
      expect(result.current.paginaActual).toBe(2);
    });
  });

  describe("limpieza", () => {
    it("restablece los filtros y la paginación", () => {
      const { result } = renderHook(() => useHistorialPrecios());

      act(() => {
        result.current.aplicarFiltros({ ...FILTROS_INICIALES, denominacion: "coca" });
        result.current.cambiarPagina(40, 10, 5);
      });
      act(() => {
        result.current.limpiarFiltros();
      });

      expect(result.current.filtros).toEqual(FILTROS_INICIALES);
      expect(result.current.skip).toBe(0);
      expect(result.current.paginaActual).toBe(1);
    });
  });

  describe("manejo de errores", () => {
    it("expone el mensaje de la API y vacía la lista", async () => {
      mocked.obtener.mockRejectedValue({
        response: { data: { message: ["La fechaDesde debe tener formato YYYY-MM-DD."] } },
      });

      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        await result.current.buscar(0, 10);
      });

      expect(result.current.error).toBe("La fechaDesde debe tener formato YYYY-MM-DD.");
      expect(result.current.registros).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it("usa un mensaje genérico si la respuesta no trae detalle", async () => {
      mocked.obtener.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useHistorialPrecios());

      await act(async () => {
        await result.current.buscar(0, 10);
      });

      expect(result.current.error).toBeTruthy();
    });

    it("limpia el error previo cuando una consulta posterior funciona", async () => {
      mocked.obtener.mockRejectedValueOnce(new Error("boom"));

      const { result } = renderHook(() => useHistorialPrecios());
      await act(async () => {
        await result.current.buscar(0, 10);
      });
      expect(result.current.error).toBeTruthy();

      await act(async () => {
        await result.current.buscar(0, 10);
      });
      expect(result.current.error).toBeNull();
    });
  });

  it("gestiona el estado de carga", async () => {
    let resolver: (v: any) => void = () => {};
    mocked.obtener.mockReturnValue(
      new Promise((r) => {
        resolver = r;
      }),
    );

    const { result } = renderHook(() => useHistorialPrecios());

    let pendiente: Promise<void>;
    act(() => {
      pendiente = result.current.buscar(0, 10);
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolver({ data: [REGISTRO], total: 1 });
      await pendiente;
    });
    expect(result.current.loading).toBe(false);
  });
});

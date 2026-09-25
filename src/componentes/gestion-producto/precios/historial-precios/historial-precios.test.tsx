import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConsultarHistorialPrecios from "./historial-precios";
import HistorialPreciosService from "./services/historial-precios-service";

/**
 * CR-007 — Test de integración de la página "Historial de precios".
 *
 * Se monta la página real (hook + componentes + servicio) mockeando solo la
 * capa HTTP, para verificar el flujo completo: consulta inicial, render de la
 * tabla, estado vacío, estado de error y recarga por filtro.
 */
vi.mock("./services/historial-precios-service", () => ({
  default: {
    obtener: vi.fn(),
  },
}));

const mocked = vi.mocked(HistorialPreciosService);

const REGISTROS = [
  {
    id: 1,
    productoId: 12,
    productoDenominacion: "COCA COLA 500ML",
    productoLinea: "GASEOSAS",
    precioAnterior: 100,
    precioNuevo: 150,
    variacion: 50,
    variacionPorcentaje: 50,
    fecha: "2026-09-25T15:30:00.000Z",
    motivo: "Aumento de proveedor",
    usuarioDenominacion: "Admin",
  },
  {
    id: 2,
    productoId: 13,
    productoDenominacion: "FANTA NARANJA",
    productoLinea: "GASEOSAS",
    precioAnterior: 200,
    precioNuevo: 150,
    variacion: -50,
    variacionPorcentaje: -25,
    fecha: "2026-09-24T10:00:00.000Z",
    motivo: "Promoción",
    usuarioDenominacion: "Vendedor",
  },
];

describe("ConsultarHistorialPrecios (CR-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("Token", "fake-token");
  });

  describe("carga inicial", () => {
    it("consulta el historial al montar", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);

      await waitFor(() => expect(mocked.obtener).toHaveBeenCalled());
      expect(mocked.obtener).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });

    it("renderiza los registros recibidos", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);

      // La página monta a la vez la tabla (desktop) y las cards (mobile),
      // ocultas por CSS, así que cada registro aparece dos veces en el DOM.
      await waitFor(() => expect(screen.getAllByText("COCA COLA 500ML").length).toBe(2));
      expect(screen.getAllByText("FANTA NARANJA")).toHaveLength(2);
      expect(screen.getAllByText("Aumento de proveedor")).toHaveLength(2);
      expect(screen.getAllByText("Promoción")).toHaveLength(2);
    });

    it("muestra el total de registros encontrados", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);

      await waitFor(() => expect(screen.getByText("Historial de precios")).toBeInTheDocument());
      // título + total + ambos motivos + usuarios
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    });
  });

  describe("estado vacío", () => {
    it("muestra el mensaje de 'sin cambios registrados' cuando nunca hubo cambios", async () => {
      mocked.obtener.mockResolvedValue({ data: [], total: 0 });

      render(<ConsultarHistorialPrecios />);

      await waitFor(() =>
        expect(screen.getByText("Todavía no hay cambios de precio registrados")).toBeInTheDocument(),
      );
    });

    it("muestra un mensaje distinto cuando el filtro no arroja resultados", async () => {
      mocked.obtener.mockResolvedValue({ data: [], total: 0 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(screen.getByText("Filtros")).toBeInTheDocument());

      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "inexistente");
      await userEvent.click(screen.getByText("Buscar"));

      await waitFor(() =>
        expect(
          screen.getByText("No hay cambios de precio que coincidan con los filtros"),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("filtros", () => {
    it("vuelve a consultar con el filtro aplicado y vuelve a la página 1", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(mocked.obtener).toHaveBeenCalledTimes(1));

      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      await userEvent.click(screen.getByText("Buscar"));

      await waitFor(() => expect(mocked.obtener).toHaveBeenCalledTimes(2));
      expect(mocked.obtener).toHaveBeenLastCalledWith({ skip: 0, take: 10, denominacion: "coca" });
    });

    it("permite limpiar los filtros y vuelve a consultar sin ellos", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(mocked.obtener).toHaveBeenCalled());

      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      await userEvent.click(screen.getByText("Buscar"));
      await waitFor(() => expect(screen.getByText("filtrando")).toBeInTheDocument());

      await userEvent.click(screen.getByLabelText("Quitar filtros"));

      await waitFor(() => {
        const ultima = mocked.obtener.mock.calls[mocked.obtener.mock.calls.length - 1][0];
        expect(ultima.denominacion).toBeUndefined();
      });
    });
  });

  describe("recarga", () => {
    it("vuelve a consultar al pulsar Actualizar", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(mocked.obtener).toHaveBeenCalledTimes(1));

      await userEvent.click(screen.getByText("Actualizar"));

      await waitFor(() => expect(mocked.obtener).toHaveBeenCalledTimes(2));
    });
  });

  describe("paginación", () => {
    it("no muestra el paginador si todo entra en una página", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 2 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(screen.getAllByText("COCA COLA 500ML").length).toBe(2));

      // El componente Paginacion no se renderiza con <= 1 página
      expect(screen.queryByText("<")).not.toBeInTheDocument();
      expect(screen.queryByText(">")).not.toBeInTheDocument();
    });

    it("muestra el paginador y consulta la página siguiente", async () => {
      mocked.obtener.mockResolvedValue({ data: REGISTROS, total: 25 });

      render(<ConsultarHistorialPrecios />);
      await waitFor(() => expect(screen.getAllByText("COCA COLA 500ML").length).toBe(2));

      // 25 registros con take=10 => 3 páginas
      const botonSiguiente = screen.getByText(">").closest("button")!;
      expect(botonSiguiente).toBeEnabled();

      await userEvent.click(botonSiguiente);

      await waitFor(() => {
        const ultima = mocked.obtener.mock.calls[mocked.obtener.mock.calls.length - 1][0];
        expect(ultima.skip).toBe(10);
      });
    });
  });

  describe("manejo de errores", () => {
    it("muestra el mensaje de error devuelto por la API", async () => {
      mocked.obtener.mockRejectedValue({
        response: { data: { message: ["La fechaDesde debe tener formato YYYY-MM-DD."] } },
      });

      render(<ConsultarHistorialPrecios />);

      await waitFor(() =>
        expect(screen.getByText("La fechaDesde debe tener formato YYYY-MM-DD.")).toBeInTheDocument(),
      );
    });

    it("muestra el estado vacío si la consulta falla", async () => {
      mocked.obtener.mockRejectedValue(new Error("boom"));

      render(<ConsultarHistorialPrecios />);

      await waitFor(() =>
        expect(screen.getByText("Todavía no hay cambios de precio registrados")).toBeInTheDocument(),
      );
    });
  });
});

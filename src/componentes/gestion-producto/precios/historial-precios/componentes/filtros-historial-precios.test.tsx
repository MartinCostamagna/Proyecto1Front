import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltrosHistorialPrecios } from "./filtros-historial-precios";
import { HistorialPrecio } from "../interfaces/interfaces-historial-precios";

const REGISTRO: HistorialPrecio = {
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
};

describe("FiltrosHistorialPrecios (CR-007)", () => {
  const onBuscar = vi.fn();
  const onLimpiar = vi.fn();

  const renderFiltros = (hayFiltrosActivos = false) =>
    render(
      <FiltrosHistorialPrecios
        onBuscar={onBuscar}
        onLimpiar={onLimpiar}
        hayFiltrosActivos={hayFiltrosActivos}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("renderizado", () => {
    it("muestra el disparador de filtros de forma colapsada", () => {
      renderFiltros();

      expect(screen.getByText("Filtros")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Buscar por producto...")).not.toBeInTheDocument();
    });

    it("despliega los filtros al hacer clic", async () => {
      renderFiltros();

      await userEvent.click(screen.getByText("Filtros"));

      expect(screen.getByPlaceholderText("Buscar por producto...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Buscar por motivo...")).toBeInTheDocument();
      expect(screen.getByTitle("Desde")).toBeInTheDocument();
      expect(screen.getByTitle("Hasta")).toBeInTheDocument();
    });

    it("muestra el badge de filtrado activo solo cuando hay filtros", () => {
      const { rerender } = renderFiltros(false);
      expect(screen.queryByText("filtrando")).not.toBeInTheDocument();

      rerender(
        <FiltrosHistorialPrecios
          onBuscar={onBuscar}
          onLimpiar={onLimpiar}
          hayFiltrosActivos
        />
      );
      expect(screen.getByText("filtrando")).toBeInTheDocument();
    });
  });

  describe("búsqueda", () => {
    it("emite el filtro de producto y motivo al buscar", async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));

      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      await userEvent.type(screen.getByPlaceholderText("Buscar por motivo..."), "proveedor");
      await userEvent.click(screen.getByText("Buscar"));

      expect(onBuscar).toHaveBeenCalledWith({
        denominacion: "coca",
        motivo: "proveedor",
        fechaDesde: "",
        fechaHasta: "",
      });
    });

    it("emite el rango de fechas al buscar", async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));

      await userEvent.type(screen.getByTitle("Desde"), "2026-09-01");
      await userEvent.type(screen.getByTitle("Hasta"), "2026-09-30");
      await userEvent.click(screen.getByText("Buscar"));

      expect(onBuscar).toHaveBeenCalledWith(
        expect.objectContaining({ fechaDesde: "2026-09-01", fechaHasta: "2026-09-30" }),
      );
    });

    it("busca con Enter sin necesidad del botón", async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));

      const input = screen.getByPlaceholderText("Buscar por producto...");
      await userEvent.type(input, "coca{Enter}");

      expect(onBuscar).toHaveBeenCalledTimes(1);
    });

    it("colapsa el panel luego de buscar", async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      await userEvent.click(screen.getByText("Buscar"));

      expect(screen.queryByPlaceholderText("Buscar por producto...")).not.toBeInTheDocument();
    });
  });

  describe("rango de fechas inválido", () => {
    const buscarConRangoInvertido = async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByTitle("Desde"), "2026-09-30");
      await userEvent.type(screen.getByTitle("Hasta"), "2026-09-01");
    };

    it("advierte cuando la fecha Desde es posterior a la Hasta", async () => {
      await buscarConRangoInvertido();

      await waitFor(() =>
        expect(
          screen.getByText('La fecha "Desde" no puede ser posterior a la fecha "Hasta".'),
        ).toBeInTheDocument(),
      );
    });

    it("no dispara la búsqueda con un rango inválido", async () => {
      await buscarConRangoInvertido();

      const boton = screen.getByText("Buscar").closest("button")!;
      expect(boton).toBeDisabled();
      expect(onBuscar).not.toHaveBeenCalled();
    });
  });

  describe("limpieza", () => {
    it("el botón Limpiar está deshabilitado si no hay nada cargado", async () => {
      renderFiltros();
      await userEvent.click(screen.getByText("Filtros"));

      expect(screen.getByText("Limpiar").closest("button")).toBeDisabled();
    });

    it("limpia todos los campos y notifica al padre", async () => {
      renderFiltros(true);
      await userEvent.click(screen.getByText("Filtros"));

      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      await userEvent.click(screen.getByText("Limpiar"));

      expect(onLimpiar).toHaveBeenCalledTimes(1);
      expect(screen.getByPlaceholderText("Buscar por producto...")).toHaveValue("");
      expect(screen.getByPlaceholderText("Buscar por motivo...")).toHaveValue("");
    });

    it("el badge de limpiar permite resetear", async () => {
      renderFiltros(true);

      await userEvent.click(screen.getByLabelText("Quitar filtros"));

      expect(onLimpiar).toHaveBeenCalledTimes(1);
    });
  });

  describe("reseteo por props", () => {
    it("limpia el formulario cuando el padre avisa que ya no hay filtros", async () => {
      const { rerender } = render(
        <FiltrosHistorialPrecios
          onBuscar={onBuscar}
          onLimpiar={onLimpiar}
          hayFiltrosActivos
        />
      );

      await userEvent.click(screen.getByText("Filtros"));
      await userEvent.type(screen.getByPlaceholderText("Buscar por producto..."), "coca");
      expect(screen.getByPlaceholderText("Buscar por producto...")).toHaveValue("coca");

      rerender(
        <FiltrosHistorialPrecios
          onBuscar={onBuscar}
          onLimpiar={onLimpiar}
          hayFiltrosActivos={false}
        />
      );

      await waitFor(() =>
        expect(screen.getByPlaceholderText("Buscar por producto...")).toHaveValue(""),
      );
    });
  });

  it("el registro de ejemplo cumple el contrato de la interfaz", () => {
    // Sanity check del contrato que consume la tabla
    expect(REGISTRO.precioAnterior).toBe(100);
    expect(REGISTRO.precioNuevo).toBe(150);
    expect(REGISTRO.variacion).toBe(REGISTRO.precioNuevo - REGISTRO.precioAnterior);
  });
});

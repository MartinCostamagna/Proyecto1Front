import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatosTablaHistorial } from "./datos-tabla";
import { HistorialPrecio } from "../interfaces/interfaces-historial-precios";

const AUMENTO: HistorialPrecio = {
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

const BAJA: HistorialPrecio = {
  ...AUMENTO,
  id: 2,
  productoDenominacion: "FANTA NARANJA",
  precioAnterior: 200,
  precioNuevo: 150,
  variacion: -50,
  variacionPorcentaje: -25,
  motivo: "Promoción",
  usuarioDenominacion: "Vendedor",
};

const SIN_CAMBIO: HistorialPrecio = {
  ...AUMENTO,
  id: 3,
  productoDenominacion: "AGUA MINERAL",
  precioAnterior: 80,
  precioNuevo: 80,
  variacion: 0,
  variacionPorcentaje: 0,
  motivo: "Recarga de stock",
  usuarioDenominacion: "Admin",
};

describe("DatosTablaHistorial (CR-007)", () => {
  it("muestra los encabezados de la tabla", () => {
    render(<DatosTablaHistorial registros={[AUMENTO]} />);

    ["Fecha", "Producto", "Línea", "Precio anterior", "Precio nuevo", "Variación", "Motivo", "Usuario"].forEach(
      (columna) => {
        expect(screen.getByText(columna)).toBeInTheDocument();
      }
    );
  });

  it("renderiza una fila por registro", () => {
    render(<DatosTablaHistorial registros={[AUMENTO, BAJA, SIN_CAMBIO]} />);

    expect(screen.getByText("COCA COLA 500ML")).toBeInTheDocument();
    expect(screen.getByText("FANTA NARANJA")).toBeInTheDocument();
    expect(screen.getByText("AGUA MINERAL")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4); // 1 encabezado + 3 filas
  });

  it("muestra el precio anterior tachado y el nuevo destacado", () => {
    render(<DatosTablaHistorial registros={[AUMENTO]} />);

    const anterior = screen.getByText("100,00");
    const nuevo = screen.getByText("150,00");

    expect(anterior).toBeInTheDocument();
    expect(nuevo).toBeInTheDocument();
    expect(anterior.className).toContain("line-through");
    expect(nuevo.className).toContain("font-semibold");
  });

  describe("indicador de variación", () => {
    it("marca una baja en verde con signo negativo", () => {
      render(<DatosTablaHistorial registros={[BAJA]} />);

      const badge = screen.getByText(/-50,00/);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("emerald");
    });

    it("marca un aumento con signo positivo", () => {
      render(<DatosTablaHistorial registros={[AUMENTO]} />);

      const badge = screen.getByText(/\+50,00/);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("red");
    });

    it("muestra 'sin cambio' cuando la variación es cero", () => {
      render(<DatosTablaHistorial registros={[SIN_CAMBIO]} />);

      expect(screen.getByText("sin cambio")).toBeInTheDocument();
    });

    it("muestra el porcentaje de variación", () => {
      render(<DatosTablaHistorial registros={[AUMENTO]} />);

      expect(screen.getByText(/50,00 %/)).toBeInTheDocument();
    });
  });

  it("muestra la fecha formateada, el motivo y el usuario", () => {
    render(<DatosTablaHistorial registros={[AUMENTO]} />);

    const fila = screen.getByText("COCA COLA 500ML").closest("tr")!;
    expect(within(fila).getByText("Aumento de proveedor")).toBeInTheDocument();
    expect(within(fila).getByText("Admin")).toBeInTheDocument();
    expect(within(fila).getByText(/25\/09\/2026/)).toBeInTheDocument();
  });

  it("renderiza el cuerpo vacío sin filas cuando no hay registros", () => {
    render(<DatosTablaHistorial registros={[]} />);

    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});

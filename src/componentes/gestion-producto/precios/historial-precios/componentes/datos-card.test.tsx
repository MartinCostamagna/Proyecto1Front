import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DatosCardHistorial } from "./datos-card";
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
};

const SIN_CAMBIO: HistorialPrecio = {
  ...AUMENTO,
  id: 3,
  precioAnterior: 80,
  precioNuevo: 80,
  variacion: 0,
  variacionPorcentaje: 0,
};

describe("DatosCardHistorial (CR-007) — vista mobile", () => {
  it("muestra producto, línea, precios, motivo, usuario y fecha", () => {
    render(<DatosCardHistorial registro={AUMENTO} />);

    expect(screen.getByText("COCA COLA 500ML")).toBeInTheDocument();
    expect(screen.getByText("GASEOSAS")).toBeInTheDocument();
    expect(screen.getByText("100,00")).toBeInTheDocument();
    expect(screen.getByText("150,00")).toBeInTheDocument();
    expect(screen.getByText("Aumento de proveedor")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText(/25\/09\/2026/)).toBeInTheDocument();
  });

  it("marca el precio anterior como tachado", () => {
    render(<DatosCardHistorial registro={AUMENTO} />);

    expect(screen.getByText("100,00").className).toContain("line-through");
  });

  it("distingue una baja de un aumento por color", () => {
    const { rerender } = render(<DatosCardHistorial registro={AUMENTO} />);
    expect(screen.getByText(/\+50,00/).className).toContain("red");

    rerender(<DatosCardHistorial registro={BAJA} />);
    expect(screen.getByText(/-50,00/).className).toContain("emerald");
  });

  it("muestra 'sin cambio' cuando la variación es cero", () => {
    render(<DatosCardHistorial registro={SIN_CAMBIO} />);

    expect(screen.getByText("sin cambio")).toBeInTheDocument();
  });

  it("muestra el porcentaje de variación junto al monto", () => {
    render(<DatosCardHistorial registro={AUMENTO} />);

    expect(screen.getByText(/50,00 %/)).toBeInTheDocument();
  });
});

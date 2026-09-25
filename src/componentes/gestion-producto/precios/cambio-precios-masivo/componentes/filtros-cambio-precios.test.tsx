import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltrosCambioPrecios from "./filtros-cambio-precios";

/**
 * CR-007 — Regla de negocio en el frontend:
 * el cambio masivo de precios exige un motivo antes de enviarse.
 *
 * El componente se renderiza aislado porque arrastra el contexto de filtros
 * global (useFiltrosContext) y de catálogos, que no aportan a esta regla.
 */
vi.mock("../../../../../context/filtros-contesxt", () => ({
  useFiltrosContext: () => ({ valoresFiltros: {} }),
}));

vi.mock("../../../../../context/catalogos-context", () => ({
  useCatalogosContext: () => ({ marcas: [], lineas: [], sublineas: [] }),
}));

const onAplicarCambios = vi.fn();
const onBuscar = vi.fn();
const onGuardarCambios = vi.fn();
const onLimpiarFiltros = vi.fn();
const fetchMarcas = vi.fn();
const fetchLineas = vi.fn();

const renderFiltros = (productosLength = 5) =>
  render(
    <FiltrosCambioPrecios
      valoresFiltros={{ denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined, sublineaId: undefined }}
      setValoresFiltros={vi.fn()}
      marcas={[]}
      lineas={[]}
      sublineas={[]}
      productosLength={productosLength}
      onBuscar={onBuscar}
      onAplicarCambios={onAplicarCambios}
      onGuardarCambios={onGuardarCambios}
      fetchMarcas={fetchMarcas}
      fetchLineas={fetchLineas}
      onLimpiarFiltros={onLimpiarFiltros}
    />
  );

const botonAplicar = () => screen.getByTitle(/Aplicar (porcentaje|monto)/).closest("button")!;
const inputMotivo = () => screen.getByPlaceholderText("Ej: Aumento de lista de precios de mayo");

describe("FiltrosCambioPrecios — motivo obligatorio (CR-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el campo de motivo como obligatorio", () => {
    renderFiltros();

    expect(screen.getByText(/Motivo del cambio/)).toBeInTheDocument();
    expect(inputMotivo()).toBeInTheDocument();
  });

  it("explica que el motivo queda registrado en el historial", () => {
    renderFiltros();

    expect(
      screen.getByText(/queda registrado en el historial de cada producto afectado/i),
    ).toBeInTheDocument();
  });

  it("mantiene deshabilitado el botón de aplicar si no hay motivo", async () => {
    renderFiltros();

    const valor = screen.getByPlaceholderText("10");
    await userEvent.type(valor, "10");

    expect(botonAplicar()).toBeDisabled();
  });

  it("mantiene deshabilitado el botón de aplicar si el motivo son solo espacios", async () => {
    renderFiltros();

    await userEvent.type(screen.getByPlaceholderText("10"), "10");
    await userEvent.type(inputMotivo(), "   ");

    expect(botonAplicar()).toBeDisabled();
  });

  it("mantiene deshabilitado el botón de aplicar si no hay valor de ajuste", async () => {
    renderFiltros();

    await userEvent.type(inputMotivo(), "Aumento de lista");

    expect(botonAplicar()).toBeDisabled();
  });

  it("habilita el botón cuando hay valor y motivo", async () => {
    renderFiltros();

    await userEvent.type(screen.getByPlaceholderText("10"), "10");
    await userEvent.type(inputMotivo(), "Aumento de lista");

    expect(botonAplicar()).toBeEnabled();
  });

  it("envía el motivo junto con el valor y el tipo", async () => {
    renderFiltros();

    await userEvent.type(screen.getByPlaceholderText("10"), "15");
    await userEvent.type(inputMotivo(), "Aumento de lista");
    await userEvent.click(botonAplicar());

    expect(onAplicarCambios).toHaveBeenCalledWith(15, "PORCENTAJE", "Aumento de lista");
  });

  it("envía el motivo cuando el tipo de ajuste es MONTO", async () => {
    renderFiltros();

    await userEvent.click(screen.getByText("Monto"));
    await userEvent.type(screen.getByPlaceholderText("50"), "50");
    await userEvent.type(inputMotivo(), "Recosto proveedor");
    await userEvent.click(botonAplicar());

    expect(onAplicarCambios).toHaveBeenCalledWith(50, "MONTO", "Recosto proveedor");
  });

  it("no envía nada al hacer clic con el botón deshabilitado", async () => {
    renderFiltros();

    await userEvent.type(screen.getByPlaceholderText("10"), "10");
    await userEvent.click(botonAplicar());

    expect(onAplicarCambios).not.toHaveBeenCalled();
  });
});

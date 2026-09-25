import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderHistorial } from "./header";

describe("HeaderHistorial (CR-007)", () => {
  const onRefrescar = vi.fn();

  it("muestra el título del módulo", () => {
    render(
      <HeaderHistorial
        entidadesTotales={12}
        datosLength={10}
        onRefrescar={onRefrescar}
        loading={false}
      />
    );

    expect(screen.getByText("Historial de precios")).toBeInTheDocument();
  });

  it("muestra las estadísticas de filtrados vs mostrados", () => {
    render(
      <HeaderHistorial
        entidadesTotales={12}
        datosLength={10}
        onRefrescar={onRefrescar}
        loading={false}
      />
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("dispara onRefrescar al pulsar Actualizar", async () => {
    render(
      <HeaderHistorial
        entidadesTotales={0}
        datosLength={0}
        onRefrescar={onRefrescar}
        loading={false}
      />
    );

    await userEvent.click(screen.getByText("Actualizar"));

    expect(onRefrescar).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el botón mientras carga", () => {
    render(
      <HeaderHistorial
        entidadesTotales={0}
        datosLength={0}
        onRefrescar={onRefrescar}
        loading
      />
    );

    expect(screen.getByText("Actualizar").closest("button")).toBeDisabled();
  });
});

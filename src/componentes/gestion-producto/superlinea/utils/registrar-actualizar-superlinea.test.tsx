import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegistrarActualizarSuperlineaForm from "./registrar-actualizar-superlinea";
import SuperlineaService from "../services/superlinea-service";

vi.mock("../services/superlinea-service", () => ({
  default: {
    nuevo: vi.fn(),
    actualizar: vi.fn(),
  },
}));

vi.mock("../../../../utils/auth", () => ({
  getUsuarioId: vi.fn(() => 7),
}));

const mockedService = vi.mocked(SuperlineaService);

describe("RegistrarActualizarSuperlineaForm", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza en modo registro", () => {
    render(
      <RegistrarActualizarSuperlineaForm onClose={onClose} onSuccess={onSuccess} />
    );

    expect(screen.getByText("Registrar Superlínea")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ingresa la denominación")
    ).toBeInTheDocument();
    expect(screen.getByText("Registrar")).toBeInTheDocument();
  });

  it("envía el formulario en modo registro", async () => {
    mockedService.nuevo.mockResolvedValue({ mensaje: "creada" } as any);
    render(
      <RegistrarActualizarSuperlineaForm onClose={onClose} onSuccess={onSuccess} />
    );

    await userEvent.type(
      screen.getByPlaceholderText("Ingresa la denominación"),
      "Alimentos"
    );
    await userEvent.click(screen.getByText("Registrar"));

    await waitFor(() => {
      expect(mockedService.nuevo).toHaveBeenCalledWith(
        expect.objectContaining({
          denominacion: "alimentos",
          usuarioCreatedId: 7,
        })
      );
    });
    expect(onSuccess).toHaveBeenCalledWith("creada", "alimentos");
  });

  it("valida denominación obligatoria antes de enviar", async () => {
    render(
      <RegistrarActualizarSuperlineaForm onClose={onClose} onSuccess={onSuccess} />
    );

    await userEvent.click(screen.getByText("Registrar"));

    expect(
      await screen.findByText("La denominación es obligatoria.")
    ).toBeInTheDocument();
    expect(mockedService.nuevo).not.toHaveBeenCalled();
  });
});
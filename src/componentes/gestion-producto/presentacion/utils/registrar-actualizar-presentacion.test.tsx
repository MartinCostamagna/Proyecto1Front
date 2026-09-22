import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegistrarActualizarPresentacionForm from "./registrar-actualizar-presentacion";
import PresentacionService from "../services/presentacion-service";

vi.mock("../services/presentacion-service", () => ({
  default: {
    nuevo: vi.fn(),
    actualizar: vi.fn(),
  },
}));

vi.mock("../../../../utils/auth", () => ({
  getUsuarioId: vi.fn(() => 7),
}));

const mockedService = vi.mocked(PresentacionService);

describe("RegistrarActualizarPresentacionForm", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza en modo registro", () => {
    render(
      <RegistrarActualizarPresentacionForm
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Registrar Presentación")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ingresa la denominación")
    ).toBeInTheDocument();
    expect(screen.getByText("Registrar")).toBeInTheDocument();
  });

  it("renderiza en modo edición con la denominación pre-cargada", () => {
    render(
      <RegistrarActualizarPresentacionForm
        presentacion={{
          id: 2,
          denominacion: "pack x6 de 500ml",
          observacion: "latas",
          sistema: 0,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usuarioCreatedId: 1,
          usuarioUpdatedId: 1,
          usuarioDeletedId: null,
        }}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Actualizar Presentación")).toBeInTheDocument();
    expect(screen.getByDisplayValue("pack x6 de 500ml")).toBeInTheDocument();
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
  });

  it("envía el formulario en modo registro", async () => {
    mockedService.nuevo.mockResolvedValue({ mensaje: "creada" } as any);
    render(
      <RegistrarActualizarPresentacionForm
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText("Ingresa la denominación"),
      "pack x6"
    );
    await userEvent.click(screen.getByText("Registrar"));

    await waitFor(() => {
      expect(mockedService.nuevo).toHaveBeenCalledWith(
        expect.objectContaining({
          denominacion: "pack x6",
          usuarioCreatedId: 7,
        })
      );
    });
    expect(onSuccess).toHaveBeenCalledWith("creada");
  });

  it("valida denominación obligatoria antes de enviar", async () => {
    render(
      <RegistrarActualizarPresentacionForm
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await userEvent.click(screen.getByText("Registrar"));

    expect(
      await screen.findByText("La denominación es obligatoria.")
    ).toBeInTheDocument();
    expect(mockedService.nuevo).not.toHaveBeenCalled();
  });

  it("no permite editar una presentación de sistema", () => {
    render(
      <RegistrarActualizarPresentacionForm
        presentacion={{
          id: 5,
          denominacion: "pack 500ml",
          observacion: null,
          sistema: 1,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usuarioCreatedId: 1,
          usuarioUpdatedId: 1,
          usuarioDeletedId: null,
        }}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Actualizar Presentación")).toBeInTheDocument();
    const denominacion = screen.getByDisplayValue("pack 500ml");
    expect(denominacion).toBeDisabled();
  });
});
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import axios from "axios";
import HistorialPreciosService from "./historial-precios-service";

vi.mock("axios");

// El servicio lee la base de la API de import.meta.env, que no existe en el
// entorno de test. Se mockea la config para aislar el test del entorno.
vi.mock("../../../../../utils/axiosConfig", () => ({
  default: { apiUrl: "http://localhost:3000/api" },
}));

// vi.mocked() no tipa bien el m'etodo suelto de axios, se castea a Mock.
const mockedAxiosGet = axios.get as unknown as Mock;

/**
 * CR-007 — Contrato HTTP del servicio de historial de precios.
 *
 * Verifica que se pegue al endpoint correcto (con el prefijo /api que define
 * main.ts) y que viaje el token de autenticación, que es lo que exige el
 * AuthGuard del backend.
 */
describe("HistorialPreciosService (CR-007)", () => {
  const API = "http://localhost:3000/api";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("Token", "fake-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("obtener", () => {
    it("debería consultar GET /producto/historial-precios", async () => {
      mockedAxiosGet.mockResolvedValue({ data: { data: [], total: 0 } });

      await HistorialPreciosService.obtener({ skip: 0, take: 10 });

      expect(mockedAxiosGet).toHaveBeenCalledWith(
        `${API}/producto/historial-precios`,
        expect.objectContaining({ params: { skip: 0, take: 10 } }),
      );
    });

    it("debería enviar el Bearer token", async () => {
      mockedAxiosGet.mockResolvedValue({ data: { data: [], total: 0 } });

      await HistorialPreciosService.obtener({ skip: 0, take: 10 });

      const opciones = mockedAxiosGet.mock.calls[0][1]!;
      expect(opciones.headers).toEqual({ Authorization: "Bearer fake-token" });
    });

    it("debería consultar sin header si no hay token", async () => {
      localStorage.removeItem("Token");
      mockedAxiosGet.mockResolvedValue({ data: { data: [], total: 0 } });

      await HistorialPreciosService.obtener({ skip: 0, take: 10 });

      const opciones = mockedAxiosGet.mock.calls[0][1]!;
      expect(opciones.headers).toEqual({});
    });

    it("debería reenviar los filtros received al backend", async () => {
      mockedAxiosGet.mockResolvedValue({ data: { data: [], total: 0 } });

      const filtros = {
        skip: 20,
        take: 25,
        denominacion: "coca",
        motivo: "aumento",
        productoId: 12,
        fechaDesde: "2026-09-01",
        fechaHasta: "2026-09-30",
      };
      await HistorialPreciosService.obtener(filtros);

      const opciones = mockedAxiosGet.mock.calls[0][1]!;
      expect(opciones.params).toEqual(filtros);
    });

    it("debería devolver la respuesta tal cual la envía el backend", async () => {
      const respuesta = { data: [{ id: 1 }], total: 1 };
      mockedAxiosGet.mockResolvedValue({ data: respuesta });

      const resultado = await HistorialPreciosService.obtener({ skip: 0, take: 10 });

      expect(resultado).toEqual(respuesta);
    });

    it("debería propagar el error si la API falla", async () => {
      mockedAxiosGet.mockRejectedValue(new Error("network"));

      await expect(HistorialPreciosService.obtener({ skip: 0, take: 10 })).rejects.toThrow(
        "network",
      );
    });
  });

  describe("obtenerProducto", () => {
    it("debería filtrar por productoId y pedir una sola fila", async () => {
      mockedAxiosGet.mockResolvedValue({ data: { data: [{ id: 7 }], total: 1 } });

      const resultado = await HistorialPreciosService.obtenerProducto(7);

      const opciones = mockedAxiosGet.mock.calls[0][1]!;
      expect(opciones.params).toEqual({ productoId: 7, skip: 0, take: 1 });
      expect(resultado).toEqual({ id: 7 });
    });

    it("debería devolver null si el producto no tiene historial", async () => {
      mockedAxiosGet.mockResolvedValue({ data: { data: [], total: 0 } });

      const resultado = await HistorialPreciosService.obtenerProducto(7);

      expect(resultado).toBeNull();
    });

    it("debería devolver null si la respuesta no trae la propiedad data", async () => {
      mockedAxiosGet.mockResolvedValue({ data: {} });

      const resultado = await HistorialPreciosService.obtenerProducto(7);

      expect(resultado).toBeNull();
    });
  });
});

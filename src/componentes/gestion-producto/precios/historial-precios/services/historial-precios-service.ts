import axios from "axios";
import axiosConfig from "../../../../../utils/axiosConfig";
import {
  HistorialPreciosResponse,
  HistorialPrecio,
} from "../interfaces/interfaces-historial-precios";

const apiUrl = axiosConfig.apiUrl;

const getAuthHeaders = () => {
  const token = localStorage.getItem("Token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const HistorialPreciosService = {
  obtener: async (filtros: Record<string, any>): Promise<HistorialPreciosResponse> => {
    const { data } = await axios.get(`${apiUrl}/producto/historial-precios`, {
      params: filtros,
      headers: getAuthHeaders(),
    });
    return data;
  },

  obtenerProducto: async (id: number): Promise<HistorialPrecio | null> => {
    const { data } = await axios.get(`${apiUrl}/producto/historial-precios`, {
      params: { productoId: id, skip: 0, take: 1 },
      headers: getAuthHeaders(),
    });
    return data?.data?.[0] ?? null;
  },
};

export default HistorialPreciosService;

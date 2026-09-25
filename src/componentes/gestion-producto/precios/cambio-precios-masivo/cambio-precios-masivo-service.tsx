import axiosConfig from "../../../../utils/axiosConfig";
import axios from "axios";
import { createCrudService } from "../../../../utils/crudFactory";
import { FormValues } from "../../producto/interfaces/interfaces-validaciones-producto";
import ProductoService from "../../producto/services/producto-service";

const apiUrl = axiosConfig.apiUrl;

const baseService = createCrudService<FormValues>("cambio-precios");

const CambioPreciosMasivoService = {
  ...baseService,

  obtenerTotales: (filtros: any, entidades: string) =>
    ProductoService.obtenerTotales(filtros, entidades),

  aplicarCambios: async (payload: {
    tipo: "PORCENTAJE" | "MONTO";
    valor: number;
    lineaId?: number;
    usuarioId: number;
    motivo: string;
  }) => {
    return ProductoService.actualizarPreciosMasivos(payload);
  },

  guardarCambios: async (payload: any) => {
    try {
      const token = localStorage.getItem("Token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.patch(`${apiUrl}/cambio-precios/guardar-cambios`, payload, { headers });
      return data;
    } catch (error) {
      throw error;
    }
  },

};

export default CambioPreciosMasivoService;

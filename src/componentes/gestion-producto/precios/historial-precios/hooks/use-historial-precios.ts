import { useState, useCallback } from "react";
import {
  FiltrosHistorialPreciosValues,
  HistorialPrecio,
} from "../interfaces/interfaces-historial-precios";
import HistorialPreciosService from "../services/historial-precios-service";
import { parseApiError } from "../../../../../utils/errores";

export const FILTROS_INICIALES: FiltrosHistorialPreciosValues = {
  denominacion: "",
  motivo: "",
  fechaDesde: "",
  fechaHasta: "",
};

export const useHistorialPrecios = (takeInicial: number = 10) => {
  const [registros, setRegistros] = useState<HistorialPrecio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [filtros, setFiltros] = useState<FiltrosHistorialPreciosValues>(FILTROS_INICIALES);

  const [paginaActual, setPaginaActual] = useState(1);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(takeInicial);

  const buscar = useCallback(
    async (nuevoSkip = skip, nuevoTake = take) => {
      setLoading(true);
      setError(null);

      try {
        // Solo se mandan los filtros que tienen valor, para no ensuciar la query.
        const params: Record<string, any> = { skip: nuevoSkip, take: nuevoTake };

        if (filtros.denominacion.trim()) params.denominacion = filtros.denominacion.trim();
        if (filtros.motivo.trim()) params.motivo = filtros.motivo.trim();
        if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
        if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;

        const response = await HistorialPreciosService.obtener(params);

        setRegistros(response.data ?? []);
        setTotal(response.total ?? 0);
      } catch (err) {
        setRegistros([]);
        setTotal(0);
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [filtros, skip, take],
  );

  const aplicarFiltros = useCallback(
    (nuevosFiltros: FiltrosHistorialPreciosValues) => {
      setFiltros(nuevosFiltros);
      setSkip(0);
      setPaginaActual(1);
    },
    [],
  );

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setSkip(0);
    setPaginaActual(1);
  }, []);

  const cambiarPagina = useCallback((nuevoSkip: number, nuevoTake: number, pagina: number) => {
    setSkip(nuevoSkip);
    setTake(nuevoTake);
    setPaginaActual(pagina);
  }, []);

  return {
    registros,
    loading,
    error,
    total,
    filtros,
    paginaActual,
    skip,
    take,
    buscar,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
  };
};

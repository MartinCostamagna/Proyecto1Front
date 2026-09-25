// CR-007: Historial de precios
export interface HistorialPrecio {
  id: number;
  productoId: number;
  productoDenominacion: string;
  productoLinea: string;
  precioAnterior: number;
  precioNuevo: number;
  variacion: number;
  variacionPorcentaje: number;
  fecha: string;
  motivo: string;
  usuarioDenominacion: string;
}

export interface HistorialPreciosResponse {
  data: HistorialPrecio[];
  total: number;
}

export interface FiltrosHistorialPreciosValues {
  denominacion: string;
  motivo: string;
  fechaDesde: string;
  fechaHasta: string;
}

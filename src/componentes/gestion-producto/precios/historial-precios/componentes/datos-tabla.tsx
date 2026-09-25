import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { HistorialPrecio } from "../interfaces/interfaces-historial-precios";
import {
  formatPrice,
  formatFechaHora,
  formatPercentage,
} from "../../../../herramientas/formateo-de-campos/fucion-formateo";

const VariacionBadge = ({
  variacion,
  variacionPorcentaje,
}: {
  variacion: number;
  variacionPorcentaje: number;
}) => {
  if (variacion === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
        <Minus className="h-3 w-3" />
        sin cambio
      </span>
    );
  }

  const sube = variacion > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
        sube
          ? "text-red-700 bg-red-100"
          : "text-emerald-700 bg-emerald-100"
      }`}
    >
      {sube ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {sube ? "+" : ""}
      {formatPrice(variacion)} ({formatPercentage(variacionPorcentaje)})
    </span>
  );
};

export const DatosTablaHistorial = ({
  registros,
}: {
  registros: HistorialPrecio[];
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold">Producto</th>
            <th className="px-4 py-3 text-left font-semibold">Línea</th>
            <th className="px-4 py-3 text-right font-semibold">Precio anterior</th>
            <th className="px-4 py-3 text-right font-semibold">Precio nuevo</th>
            <th className="px-4 py-3 text-left font-semibold">Variación</th>
            <th className="px-4 py-3 text-left font-semibold">Motivo</th>
            <th className="px-4 py-3 text-left font-semibold">Usuario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {registros.map((registro) => (
            <tr
              key={registro.id}
              className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                {formatFechaHora(registro.fecha)}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {registro.productoDenominacion}
              </td>
              <td className="px-4 py-3 text-gray-500">{registro.productoLinea}</td>
              <td className="px-4 py-3 text-right text-gray-500 line-through">
                {formatPrice(registro.precioAnterior)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                {formatPrice(registro.precioNuevo)}
              </td>
              <td className="px-4 py-3">
                <VariacionBadge
                  variacion={registro.variacion}
                  variacionPorcentaje={registro.variacionPorcentaje}
                />
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs">
                {registro.motivo}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {registro.usuarioDenominacion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

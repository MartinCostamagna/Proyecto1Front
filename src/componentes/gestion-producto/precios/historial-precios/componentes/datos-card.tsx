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

export const DatosCardHistorial = ({ registro }: { registro: HistorialPrecio }) => {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {registro.productoDenominacion}
          </p>
          <p className="text-xs text-gray-500">{registro.productoLinea}</p>
        </div>
        <VariacionBadge
          variacion={registro.variacion}
          variacionPorcentaje={registro.variacionPorcentaje}
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-400 line-through">
          {formatPrice(registro.precioAnterior)}
        </span>
        <span className="text-gray-400">&rarr;</span>
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(registro.precioNuevo)}
        </span>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-slate-700 space-y-1 text-xs text-gray-500">
        <p>
          <span className="font-medium text-gray-600 dark:text-gray-300">Motivo:</span>{" "}
          {registro.motivo}
        </p>
        <p>
          <span className="font-medium text-gray-600 dark:text-gray-300">Usuario:</span>{" "}
          {registro.usuarioDenominacion}
        </p>
        <p>{formatFechaHora(registro.fecha)}</p>
      </div>
    </div>
  );
};

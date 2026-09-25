import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, X, RotateCcw } from "lucide-react";
import { Input } from "../../../../ui/Input";
import { Button } from "../../../../ui/Button";
import { FiltrosHistorialPreciosValues } from "../interfaces/interfaces-historial-precios";

interface FiltrosHistorialPreciosProps {
  onBuscar: (filtros: FiltrosHistorialPreciosValues) => void;
  onLimpiar: () => void;
  hayFiltrosActivos: boolean;
}

const VACIO: FiltrosHistorialPreciosValues = {
  denominacion: "",
  motivo: "",
  fechaDesde: "",
  fechaHasta: "",
};

export const FiltrosHistorialPrecios = ({
  onBuscar,
  onLimpiar,
  hayFiltrosActivos,
}: FiltrosHistorialPreciosProps) => {
  const [abierto, setAbierto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosHistorialPreciosValues>(VACIO);

  // Si el padre limpia los filtros, el form también se resetea.
  useEffect(() => {
    if (!hayFiltrosActivos) setFiltros(VACIO);
  }, [hayFiltrosActivos]);

  const setCampo = (campo: keyof FiltrosHistorialPreciosValues, valor: string) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const hayAlguno =
    filtros.denominacion.trim() ||
    filtros.motivo.trim() ||
    filtros.fechaDesde ||
    filtros.fechaHasta;

  const rangosInvalidos =
    !!filtros.fechaDesde &&
    !!filtros.fechaHasta &&
    filtros.fechaDesde > filtros.fechaHasta;

  const buscar = () => {
    if (rangosInvalidos) return;
    onBuscar(filtros);
    setAbierto(false);
  };

  const limpiar = () => {
    setFiltros(VACIO);
    onLimpiar();
  };

  return (
    <div className="px-4 pt-2 pb-1 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setAbierto((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
        </button>

        {hayFiltrosActivos && (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-0.5">
            <Search size={12} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              filtrando
            </span>
            <button
              onClick={limpiar}
              aria-label="Quitar filtros"
              title="Quitar filtros"
              className="text-blue-400 hover:text-blue-600 ml-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {abierto && (
        <div className="mt-3 w-full flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por producto..."
                value={filtros.denominacion}
                onChange={(e) => setCampo("denominacion", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por motivo..."
                value={filtros.motivo}
                onChange={(e) => setCampo("motivo", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setCampo("fechaDesde", e.target.value)}
                title="Desde"
                className="w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              />
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setCampo("fechaHasta", e.target.value)}
                title="Hasta"
                className="w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              />
            </div>
          </div>

          {rangosInvalidos && (
            <p className="text-sm text-red-500">
              La fecha "Desde" no puede ser posterior a la fecha "Hasta".
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
              onClick={buscar}
              disabled={rangosInvalidos}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>

            <Button
              variant="outline"
              className="shrink-0"
              onClick={limpiar}
              disabled={!hayAlguno}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

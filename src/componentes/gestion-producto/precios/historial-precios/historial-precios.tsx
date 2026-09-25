import { useEffect } from "react";
import { History } from "lucide-react";
import { Card, CardContent } from "../../../ui/Card";
import Paginacion from "../../../herramientas/reutilizables/paginacion";
import { useHistorialPrecios } from "./hooks/use-historial-precios";
import { FiltrosHistorialPrecios } from "./componentes/filtros-historial-precios";
import { HeaderHistorial } from "./componentes/header";
import { DatosTablaHistorial } from "./componentes/datos-tabla";
import { DatosCardHistorial } from "./componentes/datos-card";
import { FiltrosHistorialPreciosValues } from "./interfaces/interfaces-historial-precios";

export default function ConsultarHistorialPrecios() {
  const {
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
  } = useHistorialPrecios(10);

  // Carga inicial + recarga al cambiar filtros, skip o take.
  useEffect(() => {
    buscar(skip, take);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, skip, take]);

  const hayFiltrosActivos = !!(
    filtros.denominacion.trim() ||
    filtros.motivo.trim() ||
    filtros.fechaDesde ||
    filtros.fechaHasta
  );

  const handleBuscar = (nuevos: FiltrosHistorialPreciosValues) => {
    aplicarFiltros(nuevos);
  };

  const handleLimpiar = () => {
    limpiarFiltros();
  };

  return (
    <div className="w-full p-6">
      <Card>
        <HeaderHistorial
          entidadesTotales={total}
          datosLength={registros.length}
          onRefrescar={() => buscar(skip, take)}
          loading={loading}
        />

        <CardContent className="p-0">
          <FiltrosHistorialPrecios
            onBuscar={handleBuscar}
            onLimpiar={handleLimpiar}
            hayFiltrosActivos={hayFiltrosActivos}
          />

          {error && (
            <div className="px-4 pt-2">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 text-lg">Cargando historial...</p>
            </div>
          ) : registros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <History className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">
                {hayFiltrosActivos
                  ? "No hay cambios de precio que coincidan con los filtros"
                  : "Todavía no hay cambios de precio registrados"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {hayFiltrosActivos
                  ? "Probá con otros criterios de búsqueda."
                  : "El historial se genera al editar el precio de un producto o al hacer un cambio masivo de precios."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block">
                <DatosTablaHistorial registros={registros} />
              </div>

              {/* Mobile */}
              <div className="lg:hidden space-y-4 px-4 pb-4">
                {registros.map((registro) => (
                  <DatosCardHistorial key={registro.id} registro={registro} />
                ))}
              </div>
            </>
          )}

          <div className="px-4 pb-4">
            <Paginacion
              entidadesTotales={total}
              take={take}
              paginaActual={paginaActual}
              onChange={cambiarPagina}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
